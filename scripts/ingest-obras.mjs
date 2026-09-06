#!/usr/bin/env node
/**
 * Toma el CSV de scripts/parse-galeria.mjs, convierte las imagenes a WebP en
 * tres tamanos, las sube al bucket `medios` y escribe las filas en `obras`.
 *
 *   node scripts/ingest-obras.mjs [csv] [--dry-run] [--limit N] [--force]
 *
 * Es idempotente: vuelve a correrse sin duplicar nada (upsert por slug y
 * x-upsert en storage), asi que se puede cortar y retomar.
 *
 * Seleccion: usa las filas con "x" en la columna `incluir`. Si no hay ninguna
 * marcada, elige automaticamente 150 por completitud de ficha, repartidas
 * entre categorias segun el peso de cada una en la obra. Los encargos sin
 * categoria quedan afuera: si un encargo es figurativo o abstracto solo lo
 * sabe Santiago, y no es algo que convenga adivinar.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const RAIZ_PROY = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAIZ_MEDIA = "/home/nch/Escritorio/pagina_web_santiago";
const CUPO_TOTAL = 150;
const BUCKET = "medios";

// tamanos: [sufijo, lado maximo, calidad]
const TAMANOS = [
  ["sm", 400, 72],
  ["md", 900, 78],
  ["lg", 1800, 80],
];

// ---------- env ----------
for (const linea of readFileSync(join(RAIZ_PROY, ".env.local"), "utf8").split("\n")) {
  const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_SB || !SERVICE || SERVICE.startsWith("PENDIENTE")) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

// ---------- args ----------
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const FORCE = args.includes("--force");
const iLim = args.indexOf("--limit");
const LIMITE = iLim >= 0 ? Number(args[iLim + 1]) : Infinity;
const CSV = args.find((a) => !a.startsWith("--") && a !== String(LIMITE))
  ?? "/home/nch/Escritorio/obras-santiago.csv";

// ---------- CSV ----------
function leerCSV(ruta) {
  const txt = readFileSync(ruta, "utf8").replace(/^﻿/, "");
  const filas = [];
  let campo = "", fila = [], enComillas = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (enComillas) {
      if (c === '"') {
        if (txt[i + 1] === '"') { campo += '"'; i++; } else enComillas = false;
      } else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = ""; }
    else if (c !== "\r") campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const cab = filas.shift();
  return filas
    .filter((f) => f.some((v) => v !== ""))
    .map((f) => Object.fromEntries(cab.map((c, i) => [c, (f[i] ?? "").trim()])));
}

// ---------- seleccion ----------
const marcada = (r) => /^(x|si|sí|1|true)$/i.test(r.incluir);
const puntaje = (r) =>
  (r.anio ? 4 : 0) + (r.tecnica ? 3 : 0) + (r.ancho_cm ? 2 : 0) + (r.soporte ? 1 : 0);

function seleccionar(filas) {
  const marcadas = filas.filter(marcada);
  if (marcadas.length) {
    console.log(`  ${marcadas.length} obras marcadas con "x" en el CSV\n`);
    return marcadas;
  }
  const elegibles = filas.filter(
    (r) => r.titulo && r.categoria && !r.revisar.includes("baja-resolucion")
  );
  // Cupo por categoria proporcional a lo disponible: mantiene el peso real de
  // la obra en vez de inventar un equilibrio que no existe.
  const porCat = {};
  for (const r of elegibles) (porCat[r.categoria] ??= []).push(r);
  const salida = [];
  for (const [cat, lista] of Object.entries(porCat)) {
    const cupo = Math.round((lista.length / elegibles.length) * CUPO_TOTAL);
    lista.sort((a, b) => puntaje(b) - puntaje(a) || a.titulo.localeCompare(b.titulo, "es"));
    salida.push(...lista.slice(0, cupo));
    console.log(`  ${cat.padEnd(11)} ${String(cupo).padStart(3)} de ${lista.length} elegibles`);
  }
  console.log(
    `\n  Nadie marco la columna 'incluir', asi que se eligieron ${salida.length}\n` +
    `  automaticamente por completitud de ficha. Quedaron afuera los encargos\n` +
    `  sin categoria: eso lo tiene que definir Santiago.\n`
  );
  return salida;
}

// ---------- imagenes ----------
function convertir(origen, destino, lado, calidad) {
  execFileSync("convert", [
    `${origen}[0]`, "-auto-orient",
    "-resize", `${lado}x${lado}>`,
    "-strip", "-quality", String(calidad),
    "-define", "webp:method=6",
    destino,
  ], { stdio: ["ignore", "ignore", "pipe"] });
}

function medir(archivo) {
  const out = execFileSync("identify", ["-format", "%w %h", `${archivo}[0]`], { encoding: "utf8" });
  const [w, h] = out.trim().split(/\s+/).map(Number);
  return { w, h };
}

function placeholder(origen, tmp) {
  const p = join(tmp, "blur.webp");
  convertir(origen, p, 20, 40);
  return `data:image/webp;base64,${readFileSync(p).toString("base64")}`;
}

// ---------- supabase ----------
const cabecerasSB = {
  apikey: SERVICE,
  Authorization: `Bearer ${SERVICE}`,
};

async function subir(path, buf) {
  const r = await fetch(`${URL_SB}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...cabecerasSB, "Content-Type": "image/webp", "x-upsert": "true",
               "Cache-Control": "public, max-age=31536000, immutable" },
    body: buf,
  });
  if (!r.ok) throw new Error(`storage ${path}: ${r.status} ${await r.text()}`);
}

async function upsertObra(obra) {
  const r = await fetch(`${URL_SB}/rest/v1/obras?on_conflict=slug`, {
    method: "POST",
    headers: {
      ...cabecerasSB,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(obra),
  });
  if (!r.ok) throw new Error(`obras ${obra.slug}: ${r.status} ${await r.text()}`);
}

async function yaSubida(slug) {
  const r = await fetch(
    `${URL_SB}/storage/v1/object/info/${BUCKET}/obras/${slug}-lg.webp`,
    { headers: cabecerasSB }
  );
  return r.ok;
}

// ---------- main ----------
const filas = leerCSV(CSV);
console.log(`\n  CSV: ${CSV}  (${filas.length} filas)\n`);
const seleccion = seleccionar(filas).slice(0, LIMITE);

if (DRY) {
  console.log(`  --dry-run: se procesarian ${seleccion.length} obras. Primeras 10:\n`);
  for (const r of seleccion.slice(0, 10)) {
    console.log(`   ${r.categoria.padEnd(11)} ${r.anio || "----"}  ${r.titulo}`);
  }
  process.exit(0);
}

const tmp = mkdtempSync(join(tmpdir(), "santi-"));
let ok = 0, saltadas = 0, bytes = 0;
const errores = [];

for (const [i, r] of seleccion.entries()) {
  const n = `[${String(i + 1).padStart(3)}/${seleccion.length}]`;
  const origen = join(RAIZ_MEDIA, r.archivo);
  try {
    if (!existsSync(origen)) throw new Error("archivo no encontrado");
    if (!FORCE && (await yaSubida(r.slug))) {
      saltadas++;
      console.log(`${n} ~ ${r.slug}  (ya estaba)`);
      continue;
    }

    let dim = null, peso = 0;
    for (const [suf, lado, q] of TAMANOS) {
      const dest = join(tmp, `${suf}.webp`);
      convertir(origen, dest, lado, q);
      const buf = readFileSync(dest);
      peso += buf.length;
      if (suf === "lg") dim = medir(dest);
      await subir(`obras/${r.slug}-${suf}.webp`, buf);
    }
    bytes += peso;

    await upsertObra({
      slug: r.slug,
      titulo: r.titulo,
      categoria: r.categoria,
      es_encargo: /^(si|sí|x|true|1)$/i.test(r.es_encargo),
      anio: r.anio ? Number(r.anio) : null,
      tecnica: r.tecnica || null,
      ancho_cm: r.ancho_cm ? Number(r.ancho_cm) : null,
      alto_cm: r.alto_cm ? Number(r.alto_cm) : null,
      imagen: `obras/${r.slug}`,
      imagen_w: dim.w,
      imagen_h: dim.h,
      blur: placeholder(origen, tmp),
      orden: i,
    });

    ok++;
    console.log(`${n} + ${r.slug}  ${dim.w}x${dim.h}  ${Math.round(peso / 1024)} KB`);
  } catch (e) {
    errores.push({ slug: r.slug || r.archivo, msg: String(e.message).slice(0, 160) });
    console.log(`${n} ! ${r.slug || r.archivo}  ${String(e.message).slice(0, 90)}`);
  }
}

rmSync(tmp, { recursive: true, force: true });

console.log(`\n  subidas ${ok}   ya estaban ${saltadas}   errores ${errores.length}`);
console.log(`  storage nuevo: ${(bytes / 1024 / 1024).toFixed(1)} MB de 1024 MB\n`);
if (errores.length) {
  console.log("  fallaron:");
  for (const e of errores) console.log(`   ${e.slug}: ${e.msg}`);
}
