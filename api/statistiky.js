// Vercel serverless funkce — dashboard poptávek a SEO výkonu za HTTP Basic přihlášením.
// Env proměnné (Vercel → Settings → Environment Variables, NIKDY v gitu):
//   STATS_PASSWORD  + KV_REST_API_URL / KV_REST_API_TOKEN (nebo UPSTASH_REDIS_REST_*)
// URL: https://www.prvni-pozice.com/api/statistiky (uživatelské jméno je libovolné).
// SEO data plní denní cron na VPS (scripts/seo-report.py → /api/seo-data → KV klíč `seo`).

import { timingSafeEqual } from 'node:crypto';
import { uloziste, nactiPoptavky, nactiSeo, souhrn, esc, cesky, NENI_ULOZISTE } from './_uloziste.js';

export default async function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');

  const heslo = process.env.STATS_PASSWORD;
  if (!heslo) {
    // Bez hesla dashboard nikdy neběží — data o poptávkách nejsou pro veřejnost.
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(503).end('Statistiky nejsou zapnuté — ve Vercelu chybí proměnná STATS_PASSWORD.');
  }

  if (!overHeslo(req.headers.authorization, heslo)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Statistiky", charset="UTF-8"');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(401).end('Přihlaste se prosím.');
  }

  if (!uloziste()) {
    return odpovez(res, 200, sestavStranku(null, null, NENI_ULOZISTE));
  }

  let zaznamy = null;
  let seo = null;
  let chyba = null;
  try {
    [zaznamy, seo] = await Promise.all([nactiPoptavky(), nactiSeo()]);
  } catch (e) {
    console.error('statistiky: čtení selhalo:', e && e.message);
    chyba = 'Data se nepodařilo načíst, zkuste to prosím za chvíli.';
  }

  return odpovez(res, chyba ? 502 : 200, sestavStranku(zaznamy, seo, chyba));
}

// Porovnání hesla v konstantním čase (bez závislosti na délce shody).
function overHeslo(hlavicka, ocekavane) {
  const [schema, kodovane] = String(hlavicka || '').split(' ');
  if (!/^Basic$/i.test(schema || '') || !kodovane) return false;
  let dekodovane = '';
  try { dekodovane = Buffer.from(kodovane, 'base64').toString('utf8'); } catch { return false; }
  const zadane = dekodovane.slice(dekodovane.indexOf(':') + 1); // jméno ignorujeme
  const a = Buffer.from(zadane, 'utf8');
  const b = Buffer.from(String(ocekavane), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

function odpovez(res, kod, html) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(kod).end(html);
}

// ————————————————————————————————————————————————————————————————
// Formátování (cs-CZ)
// ————————————————————————————————————————————————————————————————

const cislo = (n) => Number(n || 0).toLocaleString('cs-CZ');
const procento = (f) => (Number(f || 0) * 100).toLocaleString('cs-CZ', { maximumFractionDigits: 2 }) + ' %';
const MESICE = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];
const MESICE_2P = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července',
  'srpna', 'září', 'října', 'listopadu', 'prosince'];

function mesicPopisek(klic) {          // '2025-09' → 'zář 25'
  const [r, m] = klic.split('-');
  return `${MESICE[Number(m) - 1]} ${r.slice(2)}`;
}
function mesicCely(klic) {             // '2025-09' → 'září 2025'
  const [r, m] = klic.split('-');
  return `${MESICE[Number(m) - 1]} ${r}`;
}
function datumCesky(iso) {             // '2026-08-03' → '3. srpna 2026'
  const [r, m, d] = String(iso || '').split('-').map(Number);
  if (!r || !m || !d) return '—';
  return `${d}. ${MESICE_2P[m - 1]} ${r}`;
}

// ————————————————————————————————————————————————————————————————
// Stavební prvky (karty, tabulky, delty)
// ————————————————————————————————————————————————————————————————

function tabulka(hlavicky, radky, prazdno, cisla = []) {
  if (!radky.length) return `<p class="prazdno">${prazdno}</p>`;
  const th = hlavicky.map((h, i) => `<th${cisla.includes(i) ? ' class="num"' : ''}>${h}</th>`).join('');
  const tr = radky.map((r) => `<tr>${r.map((b, i) => `<td${cisla.includes(i) ? ' class="num"' : ''}>${b}</td>`).join('')}</tr>`).join('');
  return `<div class="tab"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

// Delta šipka: smer +1 = růst je dobrý (kliky), -1 = pokles je dobrý (pozice).
function delta(hodnota, smer, format = cislo) {
  if (!Number.isFinite(hodnota) || hodnota === 0) {
    return '<span class="delta neutral">beze změny</span>';
  }
  const dobra = hodnota * smer > 0;
  const sipka = hodnota > 0 ? '▲' : '▼';
  const text = (hodnota > 0 ? '+' : '−') + format(Math.abs(hodnota));
  return `<span class="delta ${dobra ? 'dobra' : 'spatna'}">${sipka} ${text}</span>`;
}

// Statistická dlaždice: popisek · hodnota · delta · volitelný sparkline.
function dlazdice(popisek, hodnota, deltaHtml, poznamka, sparkHtml = '') {
  return `<div class="karta dlazdice">
    <span class="popis">${popisek}</span>
    <span class="cislo">${hodnota}</span>
    <span class="pozn">${deltaHtml}${poznamka ? ` <span class="pozn-text">${poznamka}</span>` : ''}</span>
    ${sparkHtml}
  </div>`;
}

// ————————————————————————————————————————————————————————————————
// Grafy (inline SVG, žádné knihovny)
// ————————————————————————————————————————————————————————————————

// Sparkline z denní řady: 8 týdenních součtů, tlumená linka, poslední bod v barvě řady.
function sparkline(denni, sloupec, barva, jednotka) {
  if (!Array.isArray(denni) || denni.length < 14) return '';
  const tydny = [];
  for (let i = 0; i + 7 <= denni.length; i += 7) {
    const kus = denni.slice(i, i + 7);
    tydny.push({
      od: kus[0][0],
      hodnota: kus.reduce((s, d) => s + (d[sloupec] || 0), 0),
    });
  }
  const W = 130, H = 34, P = 4;
  const max = Math.max(1, ...tydny.map((t) => t.hodnota));
  const x = (i) => P + (i * (W - 2 * P)) / (tydny.length - 1);
  const y = (v) => H - P - (v / max) * (H - 2 * P);
  const body = tydny.map((t, i) => `${x(i).toFixed(1)},${y(t.hodnota).toFixed(1)}`);
  const posledni = tydny[tydny.length - 1];
  const hity = tydny.map((t, i) =>
    `<circle cx="${x(i).toFixed(1)}" cy="${y(t.hodnota).toFixed(1)}" r="7" fill="transparent"><title>týden od ${datumCesky(t.od)}: ${cislo(t.hodnota)} ${jednotka}</title></circle>`).join('');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="týdenní vývoj, ${jednotka}">
    <polyline points="${body.join(' ')}" fill="none" stroke="var(--spark)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <polyline points="${body.slice(-2).join(' ')}" fill="none" stroke="${barva}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="${x(tydny.length - 1).toFixed(1)}" cy="${y(posledni.hodnota).toFixed(1)}" r="4" fill="${barva}" stroke="var(--karta)" stroke-width="2"/>
    ${hity}
  </svg>`;
}

// „Hezký" strop osy: 1/2/5 × 10^n nad maximem.
function hezkyStrop(max) {
  if (max <= 0) return 1;
  const rad = 10 ** Math.floor(Math.log10(max));
  for (const nasobek of [1, 2, 5, 10]) {
    if (nasobek * rad >= max) return nasobek * rad;
  }
  return 10 * rad;
}

// Sloupcový graf po měsících pro jednu metriku (jedna řada → bez legendy,
// název nese titulek karty). Poslední (běžící) měsíc má světlejší výplň.
function mesicniGraf(mesicni, sloupec, barva, jednotka) {
  if (!Array.isArray(mesicni) || !mesicni.length) return '<p class="prazdno">Zatím žádná data.</p>';
  const W = 560, H = 210, L = 46, R = 8, T = 14, B = 30;
  const data = mesicni.map((m) => ({ mes: m[0], hodnota: m[sloupec] || 0 }));
  const strop = hezkyStrop(Math.max(...data.map((d) => d.hodnota)));
  const krok = (W - L - R) / data.length;
  const sirka = Math.min(24, Math.round(krok * 0.62));
  const y = (v) => T + (1 - v / strop) * (H - T - B);
  const baseY = H - B;

  const mrizka = [0.5, 1].map((f) => {
    const v = strop * f;
    return `<line x1="${L}" y1="${y(v).toFixed(1)}" x2="${W - R}" y2="${y(v).toFixed(1)}" class="grid"/>
      <text x="${L - 6}" y="${y(v).toFixed(1)}" class="tick" text-anchor="end" dominant-baseline="middle">${cislo(v)}</text>`;
  }).join('');

  let nejvetsi = 0;
  data.forEach((d, i) => { if (d.hodnota > data[nejvetsi].hodnota) nejvetsi = i; });

  const prvky = data.map((d, i) => {
    const x0 = L + i * krok + (krok - sirka) / 2;
    const vyska = baseY - y(d.hodnota);
    const bezici = i === data.length - 1;
    const r = Math.min(4, sirka / 2, Math.max(0, vyska));
    // sloupec: zaoblený datový konec nahoře, rovný u základny
    const sloupecSvg = vyska > 0
      ? `<path d="M${x0},${baseY} V${(y(d.hodnota) + r).toFixed(1)} Q${x0},${y(d.hodnota).toFixed(1)} ${x0 + r},${y(d.hodnota).toFixed(1)} H${(x0 + sirka - r).toFixed(1)} Q${x0 + sirka},${y(d.hodnota).toFixed(1)} ${x0 + sirka},${(y(d.hodnota) + r).toFixed(1)} V${baseY} Z" fill="${barva}"${bezici ? ' opacity="0.45"' : ''}/>`
      : '';
    // přímý popisek jen u maxima a posledního měsíce — zbytek nese osa a tooltip
    const popisek = (i === nejvetsi || bezici) && d.hodnota > 0
      ? `<text x="${(x0 + sirka / 2).toFixed(1)}" y="${(y(d.hodnota) - 5).toFixed(1)}" class="hodnota" text-anchor="middle">${cislo(d.hodnota)}</text>`
      : '';
    // popisky osy střídavě (od posledního měsíce), ať se u 13 sloupců nemačkají
    const osaX = (data.length - 1 - i) % 2 === 0
      ? `<text x="${(x0 + sirka / 2).toFixed(1)}" y="${H - 10}" class="tick" text-anchor="middle">${mesicPopisek(d.mes)}</text>`
      : '';
    const hit = `<rect x="${(L + i * krok).toFixed(1)}" y="${T}" width="${krok.toFixed(1)}" height="${H - T - B}" fill="transparent" data-tip="${esc(mesicCely(d.mes))}${bezici ? ' (běžící)' : ''} · ${cislo(d.hodnota)} ${jednotka}"/>`;
    return sloupecSvg + popisek + osaX + hit;
  }).join('');

  return `<svg class="graf" viewBox="0 0 ${W} ${H}" role="img" aria-label="${jednotka} po měsících">
    ${mrizka}
    <line x1="${L}" y1="${baseY}" x2="${W - R}" y2="${baseY}" class="osa"/>
    ${prvky}
  </svg>`;
}

// Ukazatel indexace: výplň nese stav, nevyplněná dráha je světlejší krok téže barvy.
function indexaceMetr(indexace) {
  const podil = indexace.celkem ? indexace.indexovano / indexace.celkem : 0;
  const pct = Math.round(podil * 100);
  const stav = podil >= 0.9 ? 'ok' : podil >= 0.75 ? 'varovani' : 'kriticke';
  const stavy = Object.entries(indexace.stavy || {})
    .map(([s, n]) => `<li>${esc(s)} — <b>${cislo(n)}</b></li>`).join('');
  const alert = stav === 'ok' ? '' : `<p class="alert ${stav}"><span class="alert-ikona">${stav === 'kriticke' ? '✕' : '!'}</span>
    Indexace klesla pod ${stav === 'kriticke' ? '75' : '90'} % sitemap — projít Search Console.</p>`;
  return `<div class="metr-radek">
      <div class="metr" role="img" aria-label="indexováno ${pct} % URL ze sitemap">
        <div class="metr-vypln ${stav}" style="width:${pct}%"></div>
      </div>
      <span class="metr-popisek"><b>${cislo(indexace.indexovano)}</b> z ${cislo(indexace.celkem)} URL v indexu (${pct} %)</span>
    </div>
    ${alert}
    <details class="detaily"><summary>Stavy podle Search Console</summary><ul class="stavy">${stavy}</ul></details>
    <p class="pozn-text">Kontrola proběhla ${datumCesky(indexace.datum)} přes URL Inspection API (celá sitemap, 1× týdně).</p>`;
}

// ————————————————————————————————————————————————————————————————
// Sekce stránky
// ————————————————————————————————————————————————————————————————

function sekceSeo(seo) {
  if (!seo) {
    return `<section>
      <p class="overline">SEO výkon</p>
      <div class="karta"><p class="prazdno">SEO data se ještě nesbírají — počká se na první běh
      <code>scripts/seo-report.py</code> na serveru (denní cron).</p></div>
    </section>`;
  }

  const s = seo.souhrn28 || {};
  const p = seo.predchozi28 || {};

  const dlazdiceHtml = [
    dlazdice('Kliky · 28 dní', cislo(s.kliky), delta((s.kliky || 0) - (p.kliky || 0), 1),
      'vs. předchozích 28', sparkline(seo.denni, 1, 'var(--graf-1)', 'kliků')),
    dlazdice('Imprese · 28 dní', cislo(s.imprese), delta((s.imprese || 0) - (p.imprese || 0), 1),
      'vs. předchozích 28', sparkline(seo.denni, 2, 'var(--graf-2)', 'impresí')),
    dlazdice('CTR · 28 dní', procento(s.ctr),
      delta(((s.ctr || 0) - (p.ctr || 0)) * 100, 1, (v) => v.toLocaleString('cs-CZ', { maximumFractionDigits: 2 }) + ' p. b.'),
      'vs. předchozích 28'),
    dlazdice('Prům. pozice · 28 dní', (s.pozice || 0).toLocaleString('cs-CZ', { maximumFractionDigits: 1 }),
      delta((s.pozice || 0) - (p.pozice || 0), -1, (v) => v.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })),
      'nižší = lepší'),
  ].join('');

  const mesicniTabulka = (seo.mesicni || []).map((m) =>
    [mesicCely(m[0]), cislo(m[1]), cislo(m[2]), procento(m[3]), m[4]]);

  const prilezitosti = (seo.prilezitosti || []).map((o) => [
    `<span class="cesta">${esc(o.stranka)}</span>`,
    cislo(o.imprese), procento(o.ctr), o.pozice,
    `<b>+${cislo(o.potencial)}</b>`,
  ]);

  const dotazyTab = (seznam) => tabulka(
    ['Dotaz', 'Imprese', 'Pozice'],
    (seznam || []).map((q) => [esc(q.dotaz), cislo(q.imprese), q.pozice]),
    'Nic tu není.', [1, 2]);

  const topDotazy = tabulka(
    ['Dotaz', 'Kliky', 'Imprese', 'CTR'],
    (seo.dotazy?.top || []).map((q) => [esc(q.dotaz), cislo(q.kliky), cislo(q.imprese), procento(q.ctr)]),
    'Zatím žádná data.', [1, 2, 3]);
  const topStranky = tabulka(
    ['Stránka', 'Kliky', 'Imprese', 'CTR'],
    (seo.top_stranky || []).map((o) => [`<span class="cesta">${esc(o.stranka)}</span>`, cislo(o.kliky), cislo(o.imprese), procento(o.ctr)]),
    'Zatím žádná data.', [1, 2, 3]);

  const platformy = (seo.platformy || []).length
    ? `<div class="karty">${seo.platformy.map((pl) => dlazdice(
        esc(pl.nazev), cislo(pl.kliky28), '', `kliků · ${cislo(pl.imprese28)} impresí za 28 dní`,
        sparkline(pl.denni, 1, 'var(--graf-1)', 'kliků'))).join('')}</div>`
    : `<div class="karta platformy-cekaji"><p>Platform properties (ChatGPT a spol.) zatím API nenabízí
        a provoz je v jednotkách návštěv. Jakmile bude co ukazovat, stačí nahrát CSV export z GSC do
        <code>data/gsc-platformy/&lt;platforma&gt;/</code> na serveru — další běh reportu ho sem propíše.</p></div>`;

  return `<section>
    <p class="overline">SEO výkon</p>
    <div class="karty">${dlazdiceHtml}</div>

    <div class="mrizka-2">
      <div class="karta">
        <h2>Kliky po měsících</h2>
        ${mesicniGraf(seo.mesicni, 1, 'var(--graf-1)', 'kliků')}
      </div>
      <div class="karta">
        <h2>Imprese po měsících</h2>
        ${mesicniGraf(seo.mesicni, 2, 'var(--graf-2)', 'impresí')}
      </div>
    </div>
    <details class="detaily"><summary>Tabulka hodnot po měsících</summary>
      ${tabulka(['Měsíc', 'Kliky', 'Imprese', 'CTR', 'Pozice'], mesicniTabulka, 'Zatím žádná data.', [1, 2, 3, 4])}
    </details>

    <div class="karta">
      <h2>Příležitosti — hodně impresí, málo kliků</h2>
      <p class="podtitulek">Stránky, kde přepsání title a description může přinést nejvíc. „Potenciál" je hrubý odhad kliků měsíčně navíc při běžném CTR dané pozice.</p>
      ${tabulka(['Stránka', 'Imprese', 'CTR', 'Pozice', 'Potenciál'], prilezitosti, 'Žádné výrazné příležitosti — dobrá práce.', [1, 2, 3, 4])}
    </div>

    <div class="mrizka-3">
      <div class="karta"><h2>Nové dotazy</h2><p class="podtitulek">Objevily se v posledních 28 dnech.</p>${dotazyTab(seo.dotazy?.nove)}</div>
      <div class="karta"><h2>Ztracené dotazy</h2><p class="podtitulek">Před 28 dny byly, teď mlčí.</p>${dotazyTab(seo.dotazy?.ztracene)}</div>
      <div class="karta"><h2>Na dohled TOP 3</h2><p class="podtitulek">Pozice 4–10 — kousek od první trojky.</p>${dotazyTab(seo.dotazy?.nadohled)}</div>
    </div>

    <div class="mrizka-2">
      <div class="karta"><h2>Top dotazy · 28 dní</h2>${topDotazy}</div>
      <div class="karta"><h2>Top stránky · 28 dní</h2>${topStranky}</div>
    </div>

    <div class="karta">
      <h2>Indexace vs. sitemap</h2>
      ${seo.indexace ? indexaceMetr(seo.indexace) : '<p class="prazdno">První týdenní kontrola indexace ještě neproběhla (běží v pondělí).</p>'}
    </div>

    <h2 class="mezisekce">Platformy (ChatGPT, AI vyhledávání)</h2>
    ${platformy}
  </section>`;
}

function sekcePoptavky(zaznamy) {
  if (!Array.isArray(zaznamy)) return '';
  const t7 = souhrn(zaznamy, 7);
  const t30 = souhrn(zaznamy, 30);
  const predchozi7 = souhrn(zaznamy, 7, 7);

  const karty = [
    dlazdice('Posledních 7 dní', cislo(t7.pocet), delta(t7.pocet - predchozi7.pocet, 1), `předchozí týden ${predchozi7.pocet}`),
    dlazdice('Posledních 30 dní', cislo(t30.pocet), '', `z toho označeno jako spam: ${t30.spam}`),
    dlazdice('Celkem v úložišti', cislo(zaznamy.length), '', 'držíme posledních 500 záznamů'),
  ].join('');

  return `<section>
    <p class="overline">Poptávky z formuláře</p>
    <div class="karty">${karty}</div>

    <div class="mrizka-2">
      <div class="karta"><h2>Zájem · 30 dní</h2>
        ${tabulka(['Zájem', 'Počet'], t30.zajem.map(([k, v]) => [esc(k), cislo(v)]), 'Zatím žádná data.', [1])}</div>
      <div class="karta"><h2>Vstupní stránky · 30 dní</h2>
        ${tabulka(['Odkud přišel', 'Počet'], t30.vstupy.slice(0, 15).map(([k, v]) => [`<span class="cesta">${esc(k)}</span>`, cislo(v)]), 'Zatím žádná data.', [1])}</div>
    </div>

    <div class="karta">
      <h2>Posledních 50 poptávek</h2>
      ${tabulka(
        ['Datum a čas', 'Zájem', 'Vstupní stránka', 'Pozn.'],
        zaznamy.slice(0, 50).map((z) => [
          cesky(z.cas),
          esc((Array.isArray(z.zajem) ? z.zajem : []).join(', ') || '—'),
          `<span class="cesta">${esc(z.vstup || '—')}</span>`,
          z.spam ? '<span class="tag">SPAM?</span>' : '',
        ]),
        'Zatím žádné poptávky.',
      )}
    </div>
  </section>`;
}

// ————————————————————————————————————————————————————————————————
// Stránka (exportováno kvůli lokálnímu náhledu bez Vercelu)
// ————————————————————————————————————————————————————————————————

export function sestavStranku(zaznamy, seo, chyba = null) {
  const obdobi = seo?.obdobi ? `${datumCesky(seo.obdobi.od)} – ${datumCesky(seo.obdobi.do)}` : null;
  const obsah = chyba
    ? `<p class="err">${esc(chyba)}</p>`
    : `${sekceSeo(seo)}${sekcePoptavky(zaznamy)}`;

  return `<!doctype html><html lang="cs"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Dashboard — První pozice</title>
<style>
  :root {
    color-scheme: light dark;
    /* — brand tokeny (src/styles/tokens/colors.css) — */
    --plocha: #f7f8f5;          /* stránka */
    --karta: #ffffff;           /* povrch karet a grafů */
    --ink: #1d1f1e;
    --ink-2: #41463f;
    --ink-3: #5d626a;
    --linka: #dde0d8;           /* hairline */
    --mrizka: #eef0ea;
    --osa: #c7cbc1;
    --akcent: #98c800;          /* brand lime */
    --akcent-ink: #4f6900;      /* limetka čitelná jako text */
    --graf-1: #2f72e0;          /* kliky (validováno vůči povrchu) */
    --graf-2: #82ad00;          /* imprese — limetková řada */
    --spark: #c7cbc1;           /* tlumená linka sparkline */
    --dobra: #1f7a43;
    --spatna: #c0392b;
    --varovani-pozadi: #fdf3e3;
    --kriticke-pozadi: #fdecec;
    --metr-draha: #eaf4cf;      /* světlejší krok limetkové řady */
    --stin: 0 1px 2px rgba(29,31,30,.05), 0 4px 14px rgba(29,31,30,.05);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --plocha: #141514;
      --karta: #1d1f1e;
      --ink: #f4f5f2;
      --ink-2: #c6c9c2;
      --ink-3: #969a91;
      --linka: #33362f;
      --mrizka: #272a25;
      --osa: #41463f;
      --akcent-ink: #bcdd5e;
      --graf-1: #4489e2;        /* tmavé kroky téže dvojice (validováno) */
      --graf-2: #7aa312;
      --spark: #5d625a;
      --dobra: #4cc47a;
      --spatna: #ef7a6d;
      --varovani-pozadi: #33290f;
      --kriticke-pozadi: #3a1a17;
      --metr-draha: #2c3313;
      --stin: none;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 28px 16px 72px; font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
         color: var(--ink-2); background: var(--plocha); }
  main { max-width: 1080px; margin: 0 auto; }
  h1 { font-size: 26px; margin: 2px 0 4px; color: var(--ink); letter-spacing: -0.01em; }
  h2 { font-size: 15px; margin: 0 0 10px; color: var(--ink); }
  h2.mezisekce { margin: 26px 0 12px; }
  .kdy { margin: 0 0 30px; color: var(--ink-3); font-size: 13.5px; }
  .overline { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 11.5px;
              letter-spacing: .14em; text-transform: uppercase; color: var(--akcent-ink);
              margin: 34px 0 12px; font-weight: 600; }
  .overline::before { content: ""; display: inline-block; width: 22px; height: 3px; border-radius: 2px;
              background: var(--akcent); margin-right: 9px; vertical-align: 3px; }
  section > :first-child { margin-top: 0; }

  .karty { display: grid; grid-template-columns: repeat(auto-fit, minmax(215px, 1fr)); gap: 14px; margin-bottom: 14px; }
  .karta { background: var(--karta); border: 1px solid var(--linka); border-radius: 14px; padding: 18px;
           box-shadow: var(--stin); margin-bottom: 14px; }
  .karty .karta { margin-bottom: 0; }
  .dlazdice { display: flex; flex-direction: column; gap: 3px; }
  .popis { font-size: 12px; letter-spacing: .05em; text-transform: uppercase; color: var(--ink-3); }
  .cislo { font-size: 32px; font-weight: 650; line-height: 1.15; color: var(--ink); }
  .pozn { font-size: 12.5px; color: var(--ink-3); }
  .pozn-text { color: var(--ink-3); font-size: 12.5px; }
  .delta { font-weight: 650; }
  .delta.dobra { color: var(--dobra); }
  .delta.spatna { color: var(--spatna); }
  .delta.neutral { color: var(--ink-3); font-weight: 500; }
  .spark { width: 100%; max-width: 150px; height: 34px; margin-top: 8px; }

  .mrizka-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .mrizka-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .mrizka-2 > .karta, .mrizka-3 > .karta { margin-bottom: 14px; min-width: 0; }

  .graf { width: 100%; height: auto; display: block; }
  .graf .grid { stroke: var(--mrizka); stroke-width: 1; }
  .graf .osa { stroke: var(--osa); stroke-width: 1; }
  .graf .tick { font: 10.5px system-ui, sans-serif; fill: var(--ink-3); font-variant-numeric: tabular-nums; }
  .graf .hodnota { font: 600 11px system-ui, sans-serif; fill: var(--ink-2); }
  .podtitulek { margin: -4px 0 12px; font-size: 12.5px; color: var(--ink-3); }

  .tab { overflow-x: auto; border: 1px solid var(--linka); border-radius: 10px; }
  table { border-collapse: collapse; width: 100%; font-size: 13.5px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--mrizka); vertical-align: top; overflow-wrap: anywhere; }
  th { font-size: 11px; letter-spacing: .05em; text-transform: uppercase; color: var(--ink-3); font-weight: 600; }
  th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tr:last-child td { border-bottom: 0; }
  tbody tr:hover { background: color-mix(in srgb, var(--akcent) 6%, transparent); }
  .cesta { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12px; word-break: break-all; }
  .tag { display: inline-block; padding: 1px 7px; border-radius: 999px; background: var(--kriticke-pozadi); color: var(--spatna); font-size: 11px; font-weight: 700; }
  .prazdno { color: var(--ink-3); font-size: 13.5px; margin: 0; }
  .err { color: var(--spatna); font-weight: 500; }

  .metr-radek { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .metr { flex: 1 1 220px; height: 12px; border-radius: 999px; background: var(--metr-draha); overflow: hidden; }
  .metr-vypln { height: 100%; border-radius: 999px; background: var(--akcent); }
  .metr-vypln.varovani { background: #e0962f; }
  .metr-vypln.kriticke { background: #db4c3f; }
  .metr-popisek { font-size: 13.5px; }
  .alert { display: flex; gap: 9px; align-items: center; margin: 12px 0 0; padding: 10px 13px; border-radius: 10px; font-size: 13.5px; font-weight: 550; }
  .alert.varovani { background: var(--varovani-pozadi); }
  .alert.kriticke { background: var(--kriticke-pozadi); color: var(--spatna); }
  .alert-ikona { font-weight: 800; }
  .detaily { margin: 0 0 14px; font-size: 13.5px; }
  .detaily summary { cursor: pointer; color: var(--ink-3); padding: 4px 0; }
  .detaily[open] summary { margin-bottom: 8px; }
  .stavy { margin: 6px 0 10px; padding-left: 20px; }
  .stavy li { margin: 2px 0; }
  .platformy-cekaji p { margin: 0; font-size: 13.5px; color: var(--ink-3); }
  code { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12px;
         background: var(--mrizka); padding: 1px 5px; border-radius: 5px; }

  #tip { position: fixed; z-index: 10; pointer-events: none; background: var(--ink); color: var(--plocha);
         font-size: 12.5px; padding: 6px 10px; border-radius: 8px; opacity: 0; transition: opacity .12s;
         max-width: 260px; }

  .paticka { margin-top: 40px; font-size: 12px; color: var(--ink-3); border-top: 1px solid var(--linka); padding-top: 14px; }
  @media (max-width: 900px) { .mrizka-3 { grid-template-columns: 1fr; } }
  @media (max-width: 720px) { .mrizka-2 { grid-template-columns: 1fr; } h1 { font-size: 22px; } }
</style></head><body><main>
<p class="overline" style="margin-top:0">První pozice · interní dashboard</p>
<h1>Výkon webu na jednom místě</h1>
<p class="kdy">${obdobi ? `SEO období ${obdobi} (Search Console dodává data se zpožděním ~2 dny). ` : ''}Vygenerováno ${cesky(new Date().toISOString())}.</p>
${obsah}
<p class="paticka">Zdroje: Google Search Console (denní snapshot z VPS) a kontaktní formulář webu.
Žádné osobní údaje — jen agregované metriky, čas, zájem a vstupní stránka.</p>
</main>
<div id="tip" role="tooltip"></div>
<script>
  // jednoduchý tooltip pro sloupcové grafy (prvky s data-tip)
  const tip = document.getElementById('tip');
  let aktivni = null;
  function ukaz(e) {
    const cil = e.target.closest('[data-tip]');
    if (!cil) { if (aktivni) { tip.style.opacity = 0; aktivni = null; } return; }
    if (cil !== aktivni) { tip.textContent = cil.dataset.tip; tip.style.opacity = 1; aktivni = cil; }
    const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8);
    const y = Math.max(8, e.clientY - tip.offsetHeight - 12);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  addEventListener('pointermove', ukaz);
  addEventListener('pointerdown', ukaz);
</script>
</body></html>`;
}
