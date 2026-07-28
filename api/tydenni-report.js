// Vercel serverless funkce — týdenní souhrn poptávek e-mailem přes Resend.
// Volá ji cron na VPS (scripts/tydenni-report.sh), který v těle pošle verze Astra.
// Env proměnné (Vercel → Settings → Environment Variables, NIKDY v gitu):
//   REPORT_SECRET  RESEND_API_KEY  MAIL_FROM  MAIL_TO
//   + KV_REST_API_URL / KV_REST_API_TOKEN (nebo UPSTASH_REDIS_REST_*)

import { timingSafeEqual } from 'node:crypto';
import { uloziste, nactiPoptavky, souhrn, esc, NENI_ULOZISTE } from './_uloziste.js';

const DASHBOARD = 'https://www.prvni-pozice.com/api/statistiky';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const tajemstvi = process.env.REPORT_SECRET;
  if (!tajemstvi) {
    return res.status(503).json({ ok: false, error: 'Report není zapnutý — ve Vercelu chybí proměnná REPORT_SECRET.' });
  }
  if (!overBearer(req.headers.authorization, tajemstvi)) {
    return res.status(401).json({ ok: false, error: 'Neplatné tajemství.' });
  }
  if (!uloziste()) {
    return res.status(503).json({ ok: false, error: NENI_ULOZISTE });
  }

  // tělo: JSON s daty o Astro projektech z VPS; chybějící tělo je v pořádku
  let data = req.body;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = {}; } }
  const projekty = Array.isArray(data && data.astro) ? data.astro.slice(0, 50) : [];

  let zaznamy;
  try {
    zaznamy = await nactiPoptavky();
  } catch (e) {
    console.error('report: čtení statistik selhalo:', e && e.message);
    return res.status(502).json({ ok: false, error: 'Statistiky se nepodařilo načíst.' });
  }

  const tento = souhrn(zaznamy, 7);
  const minuly = souhrn(zaznamy, 7, 7);
  const html = mail(tento, minuly, projekty);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,          // podpora@prvni-pozice.com (ověřená doména)
        to: [process.env.MAIL_TO],            // zdenek@prvni-pozice.com
        subject: `[1P web] Týdenní souhrn — ${tento.pocet} ${sklonuj(tento.pocet)}`,
        html,
      }),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      console.error('resend error:', r.status, body);
      return res.status(502).json({ ok: false, error: 'Odeslání reportu se nezdařilo.' });
    }
  } catch (e) {
    console.error('resend fetch error:', e && e.message);
    return res.status(502).json({ ok: false, error: 'Odeslání reportu se nezdařilo.' });
  }

  return res.status(200).json({ ok: true, poptavky: tento.pocet, projekty: projekty.length });
}

// Sdílené tajemství v hlavičce Authorization: Bearer …, porovnání v konstantním čase.
function overBearer(hlavicka, ocekavane) {
  const [schema, token] = String(hlavicka || '').split(' ');
  if (!/^Bearer$/i.test(schema || '') || !token) return false;
  const a = Buffer.from(token, 'utf8');
  const b = Buffer.from(String(ocekavane), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

function sklonuj(n) {
  if (n === 1) return 'poptávka';
  if (n >= 2 && n <= 4) return 'poptávky';
  return 'poptávek';
}

// — HTML e-mail: jednoduché tabulky a inline styly (klienti nic jiného spolehlivě neumí) —

const P = 'margin:0 0 12px;font:15px/1.55 Arial,Helvetica,sans-serif;color:#16181d';
const H = 'margin:26px 0 8px;font:600 16px/1.3 Arial,Helvetica,sans-serif;color:#16181d';
const TD = 'padding:7px 10px;border-bottom:1px solid #eceff2;font:14px/1.4 Arial,Helvetica,sans-serif;color:#16181d';
const TH = 'padding:7px 10px;border-bottom:1px solid #dfe3e8;background:#f7f9fa;text-align:left;font:600 12px/1.3 Arial,Helvetica,sans-serif;color:#5b6470;text-transform:uppercase;letter-spacing:.05em';

function tabulka(hlavicky, radky, prazdno) {
  if (!radky.length) return `<p style="${P};color:#5b6470">${prazdno}</p>`;
  const th = hlavicky.map((h) => `<th style="${TH}">${h}</th>`).join('');
  const tr = radky
    .map((r) => `<tr>${r.map((b) => `<td style="${TD}">${b}</td>`).join('')}</tr>`)
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:1px solid #dfe3e8;border-radius:6px">
    <thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

function mail(tento, minuly, projekty) {
  const rozdil = tento.pocet - minuly.pocet;
  const smer = rozdil > 0 ? `o ${rozdil} víc` : rozdil < 0 ? `o ${-rozdil} méně` : 'stejně';
  const zastarale = projekty.filter((p) => p && p.aktualni === false).length;

  return `<div style="background:#f6f7f9;padding:20px 0">
<div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e3e6ea;border-radius:10px;padding:24px">
  <p style="margin:0 0 4px;font:600 19px/1.3 Arial,Helvetica,sans-serif;color:#16181d">Týdenní souhrn — web První pozice</p>
  <p style="${P};color:#5b6470">Poptávky z kontaktního formuláře za posledních 7 dní.</p>

  <p style="margin:18px 0 4px;font:700 40px/1 Arial,Helvetica,sans-serif;color:#16181d">${tento.pocet}</p>
  <p style="${P}">${sklonuj(tento.pocet)} za posledních 7 dní — ${smer} než předchozí týden (${minuly.pocet}).${
    tento.spam ? ` Z toho ${tento.spam} označeno jako možný spam.` : ''
  }</p>

  <p style="${H}">Zájem</p>
  ${tabulka(['Zájem', 'Počet'], tento.zajem.map(([k, v]) => [esc(k), v]), 'Tento týden nikdo nezaškrtl žádný zájem.')}

  <p style="${H}">Vstupní stránky</p>
  ${tabulka(['Odkud přišel', 'Počet'], tento.vstupy.slice(0, 10).map(([k, v]) => [esc(k), v]), 'Žádná data.')}

  <p style="${H}">Astro projekty</p>
  ${
    projekty.length
      ? tabulka(
          ['Projekt', 'Verze', 'Nejnovější', 'Stav'],
          projekty.map((p) => {
            const ok = p && p.aktualni !== false;
            const stav = ok
              ? '<span style="color:#3a7d00;font-weight:700">aktuální</span>'
              : '<span style="color:#c62828;font-weight:700">zastaralé</span>';
            return [
              ok ? esc(p && p.projekt) : `<b>${esc(p && p.projekt)}</b>`,
              esc((p && p.verze) || '—'),
              esc((p && p.nejnovejsi) || '—'),
              stav,
            ];
          }),
          'Data o verzích nedorazila.',
        )
      : `<p style="${P};color:#5b6470">Data o verzích Astra nedorazila (skript na serveru je nepřiložil).</p>`
  }
  ${zastarale ? `<p style="${P};color:#c62828">Pozor: ${zastarale} ${zastarale === 1 ? 'projekt' : 'projekty'} nejsou na aktuální hlavní verzi Astra.</p>` : ''}

  <p style="margin:26px 0 0"><a href="${DASHBOARD}" style="display:inline-block;padding:10px 16px;background:#16181d;color:#fff;border-radius:6px;font:600 14px Arial,Helvetica,sans-serif;text-decoration:none">Otevřít dashboard</a></p>
  <p style="margin:14px 0 0;font:12px/1.5 Arial,Helvetica,sans-serif;color:#8a93a0">Statistika neobsahuje žádné osobní údaje — jen čas, zaškrtnutý zájem a vstupní stránku.</p>
</div></div>`;
}
