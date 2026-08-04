#!/usr/bin/env node
/**
 * Vygeneruje self-hostované fonty osekané na češtinu.
 *
 * Proč vlastní subset místo @fontsource: fontsource dodává latin a latin-ext
 * jako dva samostatné soubory, takže každý řez stojí dva požadavky a české
 * texty si vždycky vyžádají oba. Devět řezů = 16–18 požadavků a ~260 kB.
 * Tady se z plného TTF vyřízne jedna sada znaků (latinka + česká diakritika
 * + typografická interpunkce) do jednoho souboru na řez.
 *
 *   node scripts/subset-fonts.mjs           vygeneruje fonty + src/styles/fonts.js
 *   node scripts/subset-fonts.mjs --check   ověří, že dist/ nepoužívá znak mimo subset
 *
 * Výstup patří do gitu — build ani Vercel tenhle skript nespouští.
 * Licence: Roboto i Roboto Mono jsou pod Apache License 2.0, self-hosting i subsetting
 * jsou povolené. Kopie licencí jsou v src/styles/fonts/.
 */
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import subsetFont from 'subset-font';

const OUT_DIR = 'src/styles/fonts';
const MODULE_PATH = 'src/styles/fonts.js';

/** Řezy, které web opravdu sází — viz --font-* tokeny v design-system.css. */
const FACES = [
  { family: 'Roboto', file: 'roboto', weights: [400, 500, 700, 900] },
  { family: 'Roboto Mono', file: 'roboto-mono', weights: [400, 500] },
];

/**
 * Rozsahy znaků. Latin Extended-A se schválně nebere celá — z jejích 128 znaků
 * potřebuje střední Evropa ani ne polovinu a každý glyf se počítá (fonty jsou
 * na téhle stránce jediné, co brzdí první vykreslení). Z Latin-1 se berou jen
 * písmena a znaky, které web opravdu sází.
 */
const RANGES = [
  [0x0020, 0x007e], // základní latinka
  [0x00a0, 0x00a0], // nezlomitelná mezera
  [0x00a9, 0x00a9], // © (patička)
  [0x00b0, 0x00b0], // °
  [0x00b2, 0x00b3], // ² ³ (m², m³)
  [0x00b7, 0x00b7], // · (oddělovač v drobečkové navigaci)
  [0x00d7, 0x00d7], // × (rozměry strojů)
  [0x2010, 0x2015], // spojovníky a pomlčky – —
  [0x2018, 0x201e], // uvozovky ' ' " „
  [0x2026, 0x2026], // …
  [0x20ac, 0x20ac], // €
  [0x2039, 0x203a], // ‹ › (oddělovač v drobečkové navigaci)
  [0x2190, 0x2192], // ← ↑ → (šipky „zpět“ a „dál“)
  [0x2260, 0x2260], // ≠
  [0x25b6, 0x25b8], // ▶ (ovládání přehrávače)
  [0x279c, 0x279c], // ➜
  [0x2713, 0x2716], // ✓ ✔ ✕ ✖ (✕ zavírá lightbox a mobilní menu)
];

/** Diakritika z Latin-1 a Latin Extended-A pro češtinu, slovenštinu a polštinu. */
const EXTRA_LETTERS =
  'ÁáÄäČčĎďÉéĚěÍíĹĺĽľŇňÓóÔôŘřŔŕŠšŤťÚúŮůÝýŽž' + // CZ + SK
  'ĄąĆćĘęŁłŃńÖöÓóŚśÜüŹźŻż' + // PL a přehlásky
  'ÀàÂâÇçÈèÊêÎîÔôÙùÛûÜüßÑñÅåØøÆæ'; // občasná cizí jména

const charset = () => {
  let s = '';
  for (const [from, to] of RANGES) {
    for (let c = from; c <= to; c++) s += String.fromCodePoint(c);
  }
  return s + EXTRA_LETTERS;
};

const extraSet = new Set([...EXTRA_LETTERS].map((c) => c.codePointAt(0)));
const inCharset = (cp) =>
  extraSet.has(cp) || RANGES.some(([f, t]) => cp >= f && cp <= t);

/** Google Fonts vrací TTF, jen když se tváříš jako prohlížeč bez podpory woff2. */
async function ttfUrls(family, weights) {
  const q = `family=${encodeURIComponent(family)}:wght@${weights.join(';')}`;
  const res = await fetch(`https://fonts.googleapis.com/css2?${q}&display=swap`, {
    headers: { 'User-Agent': 'Mozilla/4.0' },
  });
  if (!res.ok) throw new Error(`Google Fonts ${family}: HTTP ${res.status}`);
  const css = await res.text();
  const out = new Map();
  const blocks = css.split('@font-face').slice(1);
  for (const b of blocks) {
    const w = b.match(/font-weight:\s*(\d+)/)?.[1];
    const url = b.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
    const style = b.match(/font-style:\s*(\w+)/)?.[1];
    if (w && url && style === 'normal') out.set(Number(w), url);
  }
  for (const w of weights) {
    if (!out.has(w)) throw new Error(`${family} ${w}: TTF se v odpovědi nenašlo`);
  }
  return out;
}

async function generate() {
  await mkdir(OUT_DIR, { recursive: true });
  const text = charset();
  const rows = [];

  for (const face of FACES) {
    const urls = await ttfUrls(face.family, face.weights);
    for (const weight of face.weights) {
      const res = await fetch(urls.get(weight));
      if (!res.ok) throw new Error(`${face.family} ${weight}: HTTP ${res.status}`);
      const src = Buffer.from(await res.arrayBuffer());
      // noLayoutClosure: nedrží glyfy dostupné jen přes GSUB (ligatury, alternáty).
      // Na běžném textu se to neprojeví a ušetří to zhruba desetinu velikosti.
      const out = await subsetFont(src, text, {
        targetFormat: 'woff2',
        noLayoutClosure: true,
      });
      const name = `${face.file}-${weight}.woff2`;
      await writeFile(path.join(OUT_DIR, name), out);
      rows.push({ family: face.family, weight, name, size: out.length, src: src.length });
      console.log(
        `${name.padEnd(28)} ${String(Math.round(src.length / 1024)).padStart(4)} kB TTF ` +
          `→ ${(out.length / 1024).toFixed(1)} kB woff2`,
      );
    }
  }

  // Modul, ne .css: @font-face se do stránky vkládá až po prvním vykreslení
  // (viz BaseLayout.astro), takže se hodí seznam řezů, ne hotový stylopis.
  // Import s `?url` nechá Vite soubor zahashovat → trvalá cache.
  const ident = (r) => `f${r.family.replace(/\W/g, '')}${r.weight}`;
  const js = [
    '// Generováno `node scripts/subset-fonts.mjs` — ručně needitovat.',
    '',
    ...rows.map((r) => `import ${ident(r)} from './fonts/${r.name}?url';`),
    '',
    'export const faces = [',
    ...rows.map((r) => `  { family: '${r.family}', weight: ${r.weight}, url: ${ident(r)} },`),
    '];',
    '',
  ].join('\n');
  await writeFile(MODULE_PATH, js);

  const total = rows.reduce((s, r) => s + r.size, 0);
  console.log(
    `\n${rows.length} souborů, celkem ${Math.round(total / 1024)} kB → ${MODULE_PATH}`,
  );
}

/** Ověří, že vygenerovaný web nepoužívá znak, který v subsetu chybí. */
async function check() {
  const dir = 'dist';
  if (!existsSync(dir)) throw new Error(`${dir} neexistuje — nejdřív spusť build`);

  const files = [];
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.name.endsWith('.html')) files.push(p);
    }
  };
  await walk(dir);

  const missing = new Map();
  for (const f of files) {
    const html = await readFile(f, 'utf8');
    // Jen viditelný text — ne značky, styly a skripty.
    const body = html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ');
    for (const ch of body) {
      const cp = ch.codePointAt(0);
      // Emoji a neviditelné znaky přeskoč — ty žádný textový font nekreslí,
      // vykreslí je systémový emoji font a je to v pořádku.
      const invisible = cp === 0x200b || cp === 0x200d || cp === 0xfe0f || cp === 0x00ad;
      const emoji = cp >= 0x1f000 || (cp >= 0x2600 && cp <= 0x27bf && !inCharset(cp));
      if (cp < 0x20 || invisible || emoji || inCharset(cp)) continue;
      if (!missing.has(ch)) missing.set(ch, new Set());
      missing.get(ch).add(path.relative(dir, f));
    }
  }

  console.log(`Zkontrolováno ${files.length} HTML souborů.`);
  if (!missing.size) {
    console.log('OK — všechny znaky jsou v subsetu.');
    return;
  }
  console.log(`\nCHYBÍ ${missing.size} znaků (vykreslí se náhradním fontem):`);
  for (const [ch, where] of missing) {
    const cp = ch.codePointAt(0).toString(16).padStart(4, '0').toUpperCase();
    console.log(`  ${JSON.stringify(ch)} U+${cp} — ${[...where].slice(0, 3).join(', ')}`);
  }
  process.exitCode = 1;
}

await (process.argv.includes('--check') ? check() : generate());
