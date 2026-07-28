// Vercel serverless funkce — dashboard poptávek za HTTP Basic přihlášením.
// Env proměnné (Vercel → Settings → Environment Variables, NIKDY v gitu):
//   STATS_PASSWORD  + KV_REST_API_URL / KV_REST_API_TOKEN (nebo UPSTASH_REDIS_REST_*)
// URL: https://www.prvni-pozice.com/api/statistiky (uživatelské jméno je libovolné).

import { timingSafeEqual } from 'node:crypto';
import { uloziste, nactiPoptavky, souhrn, esc, cesky, NENI_ULOZISTE } from './_uloziste.js';

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
    return odpovez(res, 200, stranka(`<p class="err">${esc(NENI_ULOZISTE)}</p>`));
  }

  let zaznamy;
  try {
    zaznamy = await nactiPoptavky();
  } catch (e) {
    console.error('statistiky: čtení selhalo:', e && e.message);
    return odpovez(res, 502, stranka('<p class="err">Statistiky se nepodařilo načíst, zkuste to prosím za chvíli.</p>'));
  }

  const t7 = souhrn(zaznamy, 7);
  const t30 = souhrn(zaznamy, 30);
  const predchozi7 = souhrn(zaznamy, 7, 7);
  const rozdil = t7.pocet - predchozi7.pocet;

  const html = `
    <div class="karty">
      ${karta('Posledních 7 dní', t7.pocet, `předchozí týden ${predchozi7.pocet} (${rozdil >= 0 ? '+' : ''}${rozdil})`)}
      ${karta('Posledních 30 dní', t30.pocet, `z toho označeno jako spam: ${t30.spam}`)}
      ${karta('Celkem v úložišti', zaznamy.length, 'držíme posledních 500 záznamů')}
    </div>

    <h2>Zájem (30 dní)</h2>
    ${tabulka(['Zájem', 'Počet'], t30.zajem.map(([k, v]) => [esc(k), v]), 'Zatím žádná data.')}

    <h2>Vstupní stránky (30 dní)</h2>
    ${tabulka(['Odkud přišel', 'Počet'], t30.vstupy.slice(0, 15).map(([k, v]) => [esc(k), v]), 'Zatím žádná data.')}

    <h2>Posledních 50 poptávek</h2>
    ${tabulka(
      ['Datum a čas', 'Zájem', 'Vstupní stránka', 'Pozn.'],
      zaznamy.slice(0, 50).map((z) => [
        cesky(z.cas),
        esc((Array.isArray(z.zajem) ? z.zajem : []).join(', ') || '—'),
        esc(z.vstup || '—'),
        z.spam ? '<span class="tag">SPAM?</span>' : '',
      ]),
      'Zatím žádné poptávky.',
    )}`;

  return odpovez(res, 200, stranka(html));
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

function karta(popis, cislo, poznamka) {
  return `<div class="karta"><span class="popis">${popis}</span><span class="cislo">${cislo}</span><span class="pozn">${poznamka}</span></div>`;
}

function tabulka(hlavicky, radky, prazdno) {
  if (!radky.length) return `<p class="prazdno">${prazdno}</p>`;
  const th = hlavicky.map((h) => `<th>${h}</th>`).join('');
  const tr = radky.map((r) => `<tr>${r.map((b) => `<td>${b}</td>`).join('')}</tr>`).join('');
  return `<div class="tab"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

function stranka(obsah) {
  return `<!doctype html><html lang="cs"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Statistiky poptávek — První pozice</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px 16px 64px; font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #16181d; background: #f6f7f9; }
  main { max-width: 900px; margin: 0 auto; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 32px 0 10px; }
  .kdy { margin: 0 0 24px; color: #667; font-size: 14px; }
  .karty { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .karta { background: #fff; border: 1px solid #e3e6ea; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 2px; }
  .popis { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: #667; }
  .cislo { font-size: 30px; font-weight: 700; line-height: 1.1; }
  .pozn { font-size: 12px; color: #667; }
  .tab { overflow-x: auto; background: #fff; border: 1px solid #e3e6ea; border-radius: 10px; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid #eef0f3; vertical-align: top; }
  th { font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: #667; background: #fbfcfd; }
  tr:last-child td { border-bottom: 0; }
  td:last-child, th:last-child { white-space: nowrap; }
  .tag { display: inline-block; padding: 1px 6px; border-radius: 999px; background: #fdecec; color: #c62828; font-size: 11px; font-weight: 700; }
  .prazdno { color: #667; font-size: 14px; }
  .err { color: #c62828; font-weight: 500; }
  @media (max-width: 640px) { .karty { grid-template-columns: 1fr; } }
</style></head><body><main>
<h1>Statistiky poptávek</h1>
<p class="kdy">Data z kontaktního formuláře na webu. Aktualizováno ${cesky(new Date().toISOString())}.</p>
${obsah}
</main></body></html>`;
}
