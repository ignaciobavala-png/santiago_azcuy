#!/usr/bin/env node
/**
 * Convierte los PDF de arquitectura en galerias de WebP y los carga.
 *
 *   node scripts/ingest-arquitectura.mjs [--dry-run]
 *
 * Ojo con la expectativa: estos PDF no se pueden "pasar a HTML". Son laminas
 * -renders, plantas, axonometricas-, no texto maquetado. El de Chapadmalal
 * tiene 5 caracteres de texto en 5 paginas: es imagen pura. Lo que si se hace
 * es rasterizar cada pagina a WebP, que es de donde sale el ahorro real
 * (49 MB de PDF -> ~3 MB), y rescatar como epigrafe el texto que exista.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const RAIZ_PROY = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARQ = "/home/nch/Escritorio/pagina_web_santiago/ARQUITECTURA";

const PROYECTOS = [
  {
    slug: "templo-circular-chacarita",
    titulo: "Templo Circular",
    ubicacion: "Cementerio de la Chacarita, Buenos Aires",
    anio: 2026,
    estado: "Proyecto",
    pdf: `${ARQ}/PROYECTO Templo en Chacarita/LAMINAS Templo Circular - Santiago Azcuy.pdf`,
    orden: 0,
  },
  {
    slug: "vivienda-chapadmalal",
    titulo: "Vivienda en Chapadmalal",
    ubicacion: "Chapadmalal, Provincia de Buenos Aires",
    anio: 2026,
    estado: "Proyecto",
    pdf: `${ARQ}/PROYECTO Vivienda en Chapadmalal/Casa en Chapadmalal.pdf`,
    orden: 1,
  },
];

const TAMANOS = [["sm", 400, 72], ["md", 900, 78], ["lg", 1800, 82]];

for (const l of readFileSync(join(RAIZ_PROY, ".env.local"), "utf8").split("\n")) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY = process.argv.includes("--dry-run");
const cab = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

const paginas = (pdf) =>
  Number(
    execFileSync("pdfinfo", [pdf], { encoding: "utf8" })
      .match(/^Pages:\s+(\d+)$/m)[1]
  );

function textoPagina(pdf, n) {
  const t = execFileSync("pdftotext", ["-f", String(n), "-l", String(n), pdf, "-"], {
    encoding: "utf8",
  });
  return t.replace(/\f/g, "").split("\n").map((l) => l.trim()).filter(Boolean).join(" ").trim();
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

async function api(ruta, body, prefer = "resolution=merge-duplicates,return=representation") {
  const r = await fetch(`${URL_SB}/rest/v1/${ruta}`, {
    method: "POST",
    headers: { ...cab, "Content-Type": "application/json", Prefer: prefer },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${ruta}: ${r.status} ${await r.text()}`);
  // Con return=minimal PostgREST responde 201 con cuerpo vacio, no 204:
  // hay que mirar el cuerpo, no el status, antes de parsear.
  const cuerpo = await r.text();
  return cuerpo ? JSON.parse(cuerpo) : null;
}

let totalBytes = 0;

for (const p of PROYECTOS) {
  const n = paginas(p.pdf);
  const pesoPdf = readFileSync(p.pdf).length;
  console.log(`\n  ${p.titulo}  —  ${n} paginas, PDF de ${(pesoPdf / 1024 / 1024).toFixed(1)} MB`);

  // La primera pagina con texto sirve de descripcion del proyecto.
  let descripcion = null;
  for (let i = 1; i <= Math.min(n, 4); i++) {
    const t = textoPagina(p.pdf, i);
    const limpio = t.replace(new RegExp(`^${p.titulo}[^.]*`, "i"), "").trim();
    if (limpio.length > 180) { descripcion = limpio.slice(0, 1200); break; }
  }

  if (DRY) {
    console.log(`   descripcion: ${descripcion ? descripcion.slice(0, 120) + "…" : "(sin texto en el PDF)"}`);
    for (let i = 1; i <= n; i++) {
      const t = textoPagina(p.pdf, i);
      console.log(`   pag ${String(i).padStart(2)}: ${t ? t.slice(0, 78) : "(imagen sin texto)"}`);
    }
    continue;
  }

  const [proy] = await api("proyectos?on_conflict=slug", [{
    slug: p.slug, titulo: p.titulo, ubicacion: p.ubicacion,
    anio: p.anio, estado: p.estado, descripcion, orden: p.orden,
  }]);

  // Se rehace la galeria entera en cada corrida: mas simple que reconciliar
  // paginas, y son pocas imagenes.
  await fetch(`${URL_SB}/rest/v1/proyecto_imagenes?proyecto_id=eq.${proy.id}`, {
    method: "DELETE", headers: cab,
  });

  const tmp = mkdtempSync(join(tmpdir(), "arq-"));
  execFileSync("pdftoppm", ["-r", "150", "-jpeg", "-jpegopt", "quality=94", p.pdf, join(tmp, "p")]);
  const rasters = readdirSync(tmp).filter((f) => f.endsWith(".jpg")).sort();

  const filas = [];
  for (const [i, raster] of rasters.entries()) {
    const base = `proyectos/${p.slug}/${String(i + 1).padStart(2, "0")}`;
    let dim = null, peso = 0;

    for (const [suf, lado, q] of TAMANOS) {
      const dest = join(tmp, `${suf}.webp`);
      execFileSync("convert", [
        join(tmp, raster), "-resize", `${lado}x${lado}>`,
        "-strip", "-quality", String(q), "-define", "webp:method=6", dest,
      ]);
      const buf = readFileSync(dest);
      peso += buf.length;
      if (suf === "lg") {
        const [w, h] = execFileSync("identify", ["-format", "%w %h", dest], { encoding: "utf8" })
          .trim().split(/\s+/).map(Number);
        dim = { w, h };
      }
      await subir(`${base}-${suf}.webp`, buf);
    }
    totalBytes += peso;

    const blurDest = join(tmp, "blur.webp");
    execFileSync("convert", [join(tmp, raster), "-resize", "20x20", "-strip", "-quality", "40", blurDest]);

    filas.push({
      proyecto_id: proy.id,
      imagen: base,
      imagen_w: dim.w,
      imagen_h: dim.h,
      blur: `data:image/webp;base64,${readFileSync(blurDest).toString("base64")}`,
      epigrafe: textoPagina(p.pdf, i + 1).slice(0, 600) || null,
      orden: i,
    });
    console.log(`   ${String(i + 1).padStart(2)}/${rasters.length}  ${dim.w}x${dim.h}  ${Math.round(peso / 1024)} KB`);
  }

  await api("proyecto_imagenes", filas, "return=minimal");
  rmSync(tmp, { recursive: true, force: true });
  console.log(`   -> ${filas.length} laminas cargadas`);
}

if (!DRY) {
  console.log(`\n  total en storage: ${(totalBytes / 1024 / 1024).toFixed(1)} MB (los PDF pesaban 49 MB)\n`);
}
