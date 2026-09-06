#!/usr/bin/env node
/**
 * Convierte el PDF de "El Aprendiz" a HTML y lo carga por capitulos.
 *
 *   node scripts/ingest-libro.mjs [--dry-run]
 *
 * El PDF viene de InDesign con el texto cortado por lineas y sin lineas en
 * blanco entre parrafos. Con `pdftotext -layout` se conserva la sangria de
 * primera linea del original, asi que el inicio de parrafo es un dato del
 * documento y no hay que adivinarlo.
 *
 * Sin -layout no alcanza: pdftotext pega pares de renglones y los largos de
 * linea salen bimodales (mediana 75, p90 135), asi que cualquier heuristica
 * de "linea corta = fin de parrafo" corta donde no debe.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const RAIZ_PROY = join(dirname(fileURLToPath(import.meta.url)), "..");
const PDF = "/home/nch/Escritorio/pagina_web_santiago/LIBRO/PDF/Azcuy_Santiago GerardoED1 December 2022 2-2-23.pdf";
const PORTADA = "/home/nch/Escritorio/pagina_web_santiago/LIBRO/PDF/EL APRENDIZ Ciudad Intradorada.png";

// El indice usa la numeracion impresa; el PDF arranca 2 paginas antes.
const OFFSET = 2;
const ULTIMA = 248;

for (const l of readFileSync(join(RAIZ_PROY, ".env.local"), "utf8").split("\n")) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY = process.argv.includes("--dry-run");

const cab = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

const texto = (desde, hasta) =>
  execFileSync("pdftotext", ["-layout", "-f", String(desde), "-l", String(hasta), PDF, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

// ---------- indice ----------
function leerIndice() {
  const crudo = texto(11, 13);
  const caps = [];
  for (const linea of crudo.split("\n")) {
    const m = linea.match(/^\s*(?:(\d+)\.\s*)?(.+?)\.{3,}\s*(\d+)\s*$/);
    if (!m) continue;
    const [, num, titulo, pag] = m;
    caps.push({
      numero: num ? Number(num) : null,
      titulo: titulo.trim(),
      pagina: Number(pag) + OFFSET,
    });
  }
  return caps;
}

// ---------- limpieza de pagina ----------
const ENCABEZADOS = /^(SANTIAGO AZCUY|EL APRENDIZ|CIUDAD INTRADORADA)\s*$/i;

function lineasUtiles(crudo) {
  return crudo
    .split("\n")
    .map((l) => l.replace(/\f/g, "").trimEnd())
    .filter((l) => {
      const t = l.trim();
      if (!t) return false;
      if (/^\d{1,3}$/.test(t)) return false;       // folio
      if (ENCABEZADOS.test(t)) return false;        // encabezado corriente
      return true;
    });
}

/**
 * Rearma parrafos por la sangria de primera linea que conserva -layout.
 * El margen normal del cuerpo es 0; un parrafo nuevo entra con ~5 espacios.
 */
function aParrafos(lineas) {
  const parrafos = [];
  let buf = [];

  const cerrar = () => {
    if (!buf.length) return;
    const p = buf.join(" ").replace(/\s+/g, " ").trim();
    if (p.length > 1) parrafos.push(p);
    buf = [];
  };

  for (const linea of lineas) {
    const sangrada = /^\s{2,}\S/.test(linea);
    const t = linea.trim();
    if (sangrada) cerrar();

    // Corte de palabra a fin de renglon: "pensa-\nmientos" -> "pensamientos"
    if (buf.length && /[a-záéíóúñ]-$/i.test(buf[buf.length - 1])) {
      buf[buf.length - 1] = buf[buf.length - 1].slice(0, -1) + t;
    } else {
      buf.push(t);
    }
  }
  cerrar();
  return parrafos;
}

const escapar = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- portada ----------
function subirPortada() {
  const tmp = mkdtempSync(join(tmpdir(), "libro-"));
  const salidas = [];
  for (const [suf, lado, q] of [["sm", 400, 74], ["md", 900, 80], ["lg", 1600, 82]]) {
    const dest = join(tmp, `${suf}.webp`);
    execFileSync("convert", [
      PORTADA, "-auto-orient", "-resize", `${lado}x${lado}>`,
      "-strip", "-quality", String(q), "-define", "webp:method=6", dest,
    ]);
    salidas.push([`libro/portada-${suf}.webp`, readFileSync(dest)]);
  }
  return salidas;
}

async function subir(path, buf) {
  const r = await fetch(`${URL_SB}/storage/v1/object/medios/${path}`, {
    method: "POST",
    headers: { ...cab, "Content-Type": "image/webp", "x-upsert": "true",
               "Cache-Control": "public, max-age=31536000, immutable" },
    body: buf,
  });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
}

// ---------- main ----------
const indice = leerIndice();
console.log(`\n  ${indice.length} entradas en el indice\n`);

const capitulos = [];
for (const [i, c] of indice.entries()) {
  const hasta = (indice[i + 1]?.pagina ?? ULTIMA + OFFSET + 1) - 1;
  let lineas = lineasUtiles(texto(c.pagina, Math.min(hasta, ULTIMA)));

  // La primera pagina del capitulo repite el numero y el titulo: se sacan
  // para que no queden como primer parrafo del cuerpo.
  while (lineas.length) {
    const t = lineas[0].trim();
    if (t === String(c.numero) || t.toLowerCase() === c.titulo.toLowerCase()) lineas.shift();
    else break;
  }

  const parrafos = aParrafos(lineas);
  const palabras = parrafos.join(" ").split(/\s+/).filter(Boolean).length;
  capitulos.push({
    numero: c.numero,
    titulo: c.titulo,
    contenido: parrafos.map((p) => `<p>${escapar(p)}</p>`).join("\n"),
    palabras,
    orden: i,
  });
  console.log(
    `  ${String(c.numero ?? "—").padStart(2)}  ${c.titulo.padEnd(24)}` +
    `pags ${String(c.pagina).padStart(3)}-${String(Math.min(hasta, ULTIMA)).padStart(3)}  ` +
    `${String(parrafos.length).padStart(3)} parrafos  ${String(palabras).padStart(5)} palabras`
  );
}

const total = capitulos.reduce((a, c) => a + c.palabras, 0);
const bytes = capitulos.reduce((a, c) => a + Buffer.byteLength(c.contenido), 0);
console.log(`\n  ${total.toLocaleString("es")} palabras  ·  ${(bytes / 1024).toFixed(0)} KB de HTML`);

if (DRY) {
  console.log("\n  --- muestra del capitulo 1 ---\n");
  console.log(capitulos[1].contenido.split("\n").slice(0, 3).join("\n\n").slice(0, 900));
  process.exit(0);
}

const r = await fetch(`${URL_SB}/rest/v1/libro_capitulos?on_conflict=orden`, {
  method: "POST",
  headers: { ...cab, "Content-Type": "application/json",
             Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify(capitulos),
});
if (!r.ok) { console.error(await r.text()); process.exit(1); }
console.log(`\n  ${capitulos.length} capitulos cargados`);

for (const [path, buf] of subirPortada()) {
  await subir(path, buf);
  console.log(`  portada: ${path}  ${(buf.length / 1024).toFixed(0)} KB`);
}
