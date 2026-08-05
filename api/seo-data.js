// Vercel serverless funkce — příjem SEO snapshotu z VPS (scripts/seo-report.py).
// Autentizace stejným tajemstvím jako týdenní report (Bearer REPORT_SECRET).
// Snapshot se uloží do KV pod klíč `seo`; čte ho dashboard i týdenní mail.

import { timingSafeEqual } from 'node:crypto';
import { uloziste, zapisSeo, NENI_ULOZISTE } from './_uloziste.js';

const MAX_VELIKOST = 256 * 1024; // snapshot má ~15 KB, tvrdý strop proti omylu

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const tajemstvi = process.env.REPORT_SECRET;
  if (!tajemstvi) {
    return res.status(503).json({ ok: false, error: 'Chybí proměnná REPORT_SECRET.' });
  }
  if (!overBearer(req.headers.authorization, tajemstvi)) {
    return res.status(401).json({ ok: false, error: 'Neplatné tajemství.' });
  }
  if (!uloziste()) {
    return res.status(503).json({ ok: false, error: NENI_ULOZISTE });
  }

  let data = req.body;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = null; } }
  if (!data || typeof data !== 'object' || !data.souhrn28 || !Array.isArray(data.denni)) {
    return res.status(400).json({ ok: false, error: 'Tělo není platný SEO snapshot.' });
  }
  if (JSON.stringify(data).length > MAX_VELIKOST) {
    return res.status(413).json({ ok: false, error: 'Snapshot je příliš velký.' });
  }

  try {
    await zapisSeo(data);
  } catch (e) {
    console.error('seo-data: zápis selhal:', e && e.message);
    return res.status(502).json({ ok: false, error: 'Zápis do úložiště selhal.' });
  }

  return res.status(200).json({ ok: true, vytvoreno: data.vytvoreno || null });
}

// Sdílené tajemství v hlavičce Authorization: Bearer …, porovnání v konstantním čase.
function overBearer(hlavicka, ocekavane) {
  const [schema, token] = String(hlavicka || '').split(' ');
  if (!/^Bearer$/i.test(schema || '') || !token) return false;
  const a = Buffer.from(token, 'utf8');
  const b = Buffer.from(String(ocekavane), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
