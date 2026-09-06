#!/usr/bin/env node
/**
 * Lee la carpeta de material de Santiago y saca un CSV con los metadatos
 * que se pueden deducir del nombre de archivo.
 *
 *   node scripts/parse-galeria.mjs [carpeta] [salida.csv]
 *
 * El CSV se abre en Excel/Sheets. La primera columna, `incluir`, viene vacia:
 * Santiago pone una "x" en las ~150 obras que entran al sitio. Ese mismo CSV
 * corregido es despues la entrada del script de ingesta.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { execFileSync } from "node:child_process";

const RAIZ = process.argv[2] ?? "/home/nch/Escritorio/pagina_web_santiago";
const SALIDA = process.argv[3] ?? "/home/nch/Escritorio/obras-santiago.csv";

// Carpeta de origen -> categoria del esquema.
// ENCARGOS no es categoria: es un flag. La categoria real la decide Santiago.
const CARPETAS = {
  "GALERIA/PINTURAS FIGURATIVOS": { categoria: "figurativo", encargo: false },
  "GALERIA/PINTURAS ABSTRACTAS": { categoria: "abstracto", encargo: false },
  "GALERIA/DIBUJOS": { categoria: "dibujo", encargo: false },
  "GALERIA/ENCARGOS": { categoria: "", encargo: true },
};

const EXT_OK = new Set([".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tif", ".tiff"]);

// `\b` de JS es ASCII: no marca limite antes de "Ó", asi que /\b[oó]leo\b/
// nunca matcheaba "Óleo". Estos limites miran letras y numeros Unicode.
const IZQ = "(?<![\\p{L}\\p{N}])";
const DER = "(?![\\p{L}\\p{N}])";
const re = (cuerpo) => new RegExp(IZQ + cuerpo + DER, "iu");

const TECNICAS = [
  [re("l[aá]pices?\\s+(?:de\\s+)?colores?"), "Lápices de color"],
  [re("l[aá]pices?\\s+acuarelables?"), "Lápices acuarelables"],
  [re("t[eé]cnica\\s+mixta"), "Técnica mixta"],
  [re("pastel(?:\\s+al\\s+[oó]leo)?"), "Pastel"],
  [re("[oó]leo"), "Óleo"],
  [re("acr[ií]lic[oa]s?"), "Acrílico"],
  [re("l[aá]pi(?:z|ces)"), "Lápiz"],
  [re("grafito"), "Grafito"],
  [re("tinta(?:\\s+china)?"), "Tinta"],
  [re("acuarelas?"), "Acuarela"],
  [re("carbonilla"), "Carbonilla"],
  [re("collage"), "Collage"],
  [re("mural"), "Mural"],
  [re("esmalte"), "Esmalte"],
];

// Nombres que son volcado de camara / redes: no tienen metadatos utiles.
const SIN_NOMBRE =
  /^(dsc[_-]?\d+|img[_-]?e?\d+|_?mg[_-]?\d+|p\d{7,}|cbar\d+|dji[_-]?\d+|eyoee\d+|photo[_-]?\d+|captura\s+de\s+pantalla.*|screenshot.*|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d{10,}(_\d+)*(_n)?|whatsapp\s+image.*)$/i;

const limpiar = (s) =>
  s
    .replace(/\s+/g, " ")
    // separadores que quedaron huerfanos al sacar tecnica/anio/medidas
    .replace(/(?:\s*[\-–—]\s*){2,}/g, " - ")
    .replace(/\s*[\-–—]\s*$/g, "")
    .replace(/\s+(?:y|e|sobre|con|de)\s*$/i, "")
    .replace(/^[\s\-–—_,.]+|[\s\-–—_,.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

// `identify` sobre 450 fotos grandes (los HEIC se decodifican enteros) tarda
// varios minutos. Se cachea por archivo para que reprocesar sea instantaneo.
const CACHE = "/tmp/santi-dims.json";
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};

function dimensiones(archivo) {
  if (cache[archivo]) return cache[archivo];
  try {
    const out = execFileSync("identify", ["-format", "%w %h", `${archivo}[0]`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const [w, h] = out.trim().split(/\s+/).map(Number);
    const r = Number.isFinite(w) && Number.isFinite(h) ? { w, h } : { w: "", h: "" };
    cache[archivo] = r;
    return r;
  } catch {
    return (cache[archivo] = { w: "", h: "" });
  }
}

function parsear(nombreArchivo) {
  // macOS guarda los acentos descompuestos (NFD); sin esto los regex fallan.
  let t = basename(nombreArchivo, extname(nombreArchivo)).normalize("NFC");

  const crudo = limpiar(t);
  const anonimo = SIN_NOMBRE.test(crudo);

  // 1. Medidas "60 x 80", "30x40 cm". Antes que el año, para que 2019 no
  //    se confunda con una medida y viceversa.
  let ancho = "", alto = "";
  const mDim = t.match(/(\d{1,3}(?:[.,]\d+)?)\s*[xX×]\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:cm\b)?/);
  if (mDim) {
    ancho = mDim[1].replace(",", ".");
    alto = mDim[2].replace(",", ".");
    t = t.replace(mDim[0], " ");
  }
  t = t.replace(/\bcms?\b\.?/gi, " ");

  // 2. Año
  let anio = "";
  const mAnio = t.match(/\b(19[5-9]\d|20[0-4]\d)\b/);
  if (mAnio) {
    anio = mAnio[1];
    t = t.replace(mAnio[0], " ");
  }

  // 3. Tecnica. Se acumulan: "Acrílico y Óleo" son dos, no la primera que caiga.
  //    El orden de TECNICAS importa: "Lápices de color" tiene que consumirse
  //    antes que "Lápiz" o queda medio nombre suelto en el titulo.
  const tecnicas = [];
  for (const [rx, nombre] of TECNICAS) {
    const m = t.match(rx);
    if (m) {
      tecnicas.push(nombre);
      t = t.replace(m[0], " ");
    }
  }
  const tecnica = tecnicas.join(" y ");

  // 4. Soporte: "sobre papel", "sobre tela", "sobre zapatilla"...
  let soporte = "";
  const mSop = t.match(/sobre\s+([\p{L}]+)/iu);
  if (mSop) {
    soporte = `sobre ${mSop[1].toLowerCase()}`;
    t = t.replace(mSop[0], " ");
  }

  // 5. Formato de papel A3/A4/A5
  let formato = "";
  const mFmt = t.match(/\bA[3-6]\b/i);
  if (mFmt) {
    formato = mFmt[0].toUpperCase();
    t = t.replace(mFmt[0], " ");
  }

  // 6. Ruido: firma del autor, marcas de copia, numeros de version sueltos
  t = t
    .replace(/santiago\s+azcuy/gi, " ")
    .replace(/\bcopia\b(\s+de)?/gi, " ")
    .replace(/\((\d+)\)/g, " ")
    .replace(/\s+\d\s*$/, " ");

  const titulo = anonimo ? "" : limpiar(t);

  return { titulo, anio, tecnica, ancho, alto, soporte, formato, anonimo, crudo };
}

// ---- recorrida ----
const filas = [];
for (const [rel, meta] of Object.entries(CARPETAS)) {
  const dir = join(RAIZ, rel);
  let entradas;
  try {
    entradas = readdirSync(dir, { recursive: true, withFileTypes: true });
  } catch {
    console.error(`  ! no se pudo leer ${rel}`);
    continue;
  }
  for (const e of entradas) {
    if (!e.isFile()) continue;
    if (e.name.startsWith("._") || e.name.startsWith(".")) continue; // fantasmas de macOS
    if (!EXT_OK.has(extname(e.name).toLowerCase())) continue;

    const abs = join(e.parentPath ?? e.path ?? dir, e.name);
    const p = parsear(e.name);
    const { w, h } = dimensiones(abs);
    const kb = Math.round(statSync(abs).size / 1024);

    filas.push({
      incluir: "",
      titulo: p.titulo,
      categoria: meta.categoria,
      es_encargo: meta.encargo ? "si" : "",
      anio: p.anio,
      tecnica: p.tecnica,
      soporte: p.soporte || p.formato,
      ancho_cm: p.ancho,
      alto_cm: p.alto,
      slug: p.titulo ? slugify(p.titulo) : "",
      px: w && h ? `${w}x${h}` : "",
      peso_kb: kb,
      revisar: [
        p.anonimo ? "sin-nombre" : "",
        !p.titulo ? "sin-titulo" : "",
        !meta.categoria ? "falta-categoria" : "",
        w && h && Math.min(w, h) < 900 ? "baja-resolucion" : "",
      ].filter(Boolean).join(" "),
      archivo: abs.slice(RAIZ.length + 1),
    });
  }
}

// Slugs repetidos: se numeran para que no choquen contra el unique de la DB.
const vistos = new Map();
for (const f of filas) {
  if (!f.slug) continue;
  const n = (vistos.get(f.slug) ?? 0) + 1;
  vistos.set(f.slug, n);
  if (n > 1) {
    f.slug = `${f.slug}-${n}`;
    f.revisar = limpiar(`${f.revisar} titulo-repetido`);
  }
}

// Primero lo aprovechable, despues lo que necesita ojo humano.
const score = (f) =>
  (f.titulo ? 8 : 0) + (f.anio ? 4 : 0) + (f.tecnica ? 2 : 0) + (f.ancho_cm ? 1 : 0);
filas.sort((a, b) => score(b) - score(a) || a.titulo.localeCompare(b.titulo, "es"));

const COLS = ["incluir","titulo","categoria","es_encargo","anio","tecnica","soporte","ancho_cm","alto_cm","slug","px","peso_kb","revisar","archivo"];
const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
writeFileSync(
  SALIDA,
  "﻿" + [COLS.join(","), ...filas.map((f) => COLS.map((c) => esc(f[c])).join(","))].join("\n") + "\n",
  "utf8"
);

writeFileSync(CACHE, JSON.stringify(cache), "utf8");

// ---- resumen ----
const n = (p) => filas.filter(p).length;
console.log(`\n  ${filas.length} imagenes  ->  ${SALIDA}\n`);
console.log(`  con titulo ....... ${n((f) => f.titulo)}`);
console.log(`  con anio ......... ${n((f) => f.anio)}`);
console.log(`  con tecnica ...... ${n((f) => f.tecnica)}`);
console.log(`  con medidas ...... ${n((f) => f.ancho_cm)}`);
console.log(`  ficha completa ... ${n((f) => f.titulo && f.anio && f.tecnica && f.ancho_cm)}`);
console.log(`\n  necesitan revision:`);
console.log(`  sin nombre ....... ${n((f) => f.revisar.includes("sin-nombre"))}`);
console.log(`  falta categoria .. ${n((f) => f.revisar.includes("falta-categoria"))}  (encargos)`);
console.log(`  baja resolucion .. ${n((f) => f.revisar.includes("baja-resolucion"))}`);
console.log(`  titulo repetido .. ${n((f) => f.revisar.includes("titulo-repetido"))}\n`);
