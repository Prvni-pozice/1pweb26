// Vercel serverless funkce — kontaktní formulář web-1P → Resend API.
// Env proměnné (Vercel → Settings → Environment Variables, NIKDY v gitu):
//   RESEND_API_KEY   MAIL_FROM   MAIL_TO
// Pozn.: MAIL_FROM musí být na doméně OVĚŘENÉ v Resendu; jinak použij onboarding@resend.dev.

// Rate limit na IP — brání vyčerpání Resend kvóty a zaplavení schránky.
// Best-effort: serverless instance je krátkodobá a běží jich víc paralelně,
// takže limit platí per-instance. Na botí smršť z jedné IP to stačí.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map(); // ip → number[] (časy odeslání)

function rateLimited(ip) {
  const now = Date.now();
  const fresh = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  // průběžný úklid, ať Map neroste donekonečna
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
  if (fresh.length >= RATE_MAX) { hits.set(ip, fresh); return true; }
  fresh.push(now);
  hits.set(ip, fresh);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Příliš mnoho pokusů. Zkuste to prosím za chvíli znovu.' });
  }

  // tělo: JSON (fetch) i urlencoded (nativní form bez JS)
  let data = req.body;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = Object.fromEntries(new URLSearchParams(data)); }
  }
  data = data || {};

  // honeypot — bot vyplní skryté pole → tvař se úspěšně, nic neodesílej
  // (nesémantický název: autofill v prohlížeči ho nerozpozná a nevyplní)
  if (data.poznamka_extra) return respond(req, res, { ok: true });

  // jen JSON (fetch z našeho JS) — nativní urlencoded POST byl spamová dálnice
  // (boti POSTují form napřímo a časová past se na něj nevztahovala);
  // reální uživatelé bez JS prakticky neexistují → tvař se úspěšně, nic neposílej
  const isJson = (req.headers['content-type'] || '').includes('application/json');
  if (!isJson) return respond(req, res, { ok: true });

  // časová past — JS posílá dobu od načtení stránky do odeslání (ms);
  // člověk potřebuje aspoň pár sekund, bot POSTuje hned nebo f_ts vůbec nepošle
  if (!(Number(data.f_ts) >= 2500)) return respond(req, res, { ok: true });

  // délkové stropy — ať se přes formulář nedá poslat megabajtový text.
  // Zároveň pryč s řídicími znaky: name a firma jdou do hlavičky Subject.
  const cap = (v, n, keepNl = false) =>
    String(v || '').replace(keepNl ? /[\x00-\x08\x0b-\x1f\x7f]/g : /[\x00-\x1f\x7f]/g, ' ').trim().slice(0, n);
  const name = cap(data.name, 120);
  const email = cap(data.email, 200);
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!name || !emailOk || !data.souhlas) {
    return res.status(400).json({ ok: false, error: 'Vyplňte prosím jméno, platný e-mail a souhlas.' });
  }

  // obsahový filtr — spam prošlý přes headless prohlížeč (JS + čekání).
  // Počítáme URL jako celé tokeny (jinak "https://www.x" = 2 shody):
  const zprava = cap(data.zprava, 5000, true); // víceřádkový text — nové řádky ponechat
  const firma = cap(data.firma, 160);
  const tel = cap(data.tel, 40);
  const links = (zprava.match(/(https?:\/\/|www\.)\S+/gi) || []).length;
  const hasCz = /[ěščřžýáíéúůťďňó]/i.test(name + firma + zprava);
  // 6+ odkazů = evidentní link-spam → tiše zahodit
  if (links >= 6) return respond(req, res, { ok: true });
  // 2–5 odkazů, nebo 1 odkaz bez jediného českého znaku → doručit s [SPAM?]
  const spamTag = (links >= 2 || (links === 1 && !hasCz)) ? '[SPAM?] ' : '';

  const zajem = cap(Array.isArray(data.zajem) ? data.zajem.join(', ') : data.zajem, 200);
  const text = [
    `Jméno:   ${name}`,
    `Firma:   ${firma || '—'}`,
    `E-mail:  ${email}`,
    `Telefon: ${tel || '—'}`,
    `Zájem:   ${zajem || '—'}`,
    '',
    'Zpráva:',
    zprava || '—',
  ].join('\n');

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
        reply_to: email,                      // odpověď míří rovnou tazateli (jen adresa — display name je uživatelský vstup)
        subject: `${spamTag}Nová poptávka z webu — ${name}${firma ? ' (' + firma + ')' : ''}`,
        text,
      }),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      console.error('resend error:', r.status, body);
      return res.status(502).json({ ok: false, error: 'Odeslání se nezdařilo, zkuste to prosím znovu.' });
    }
  } catch (e) {
    console.error('resend fetch error:', e && e.message);
    return res.status(502).json({ ok: false, error: 'Odeslání se nezdařilo, zkuste to prosím znovu.' });
  }

  return respond(req, res, { ok: true });
}

// nativní form post (bez JS) → redirect na děkovnou; fetch → JSON
function respond(req, res, json) {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('application/x-www-form-urlencoded')) {
    res.writeHead(303, { Location: '/kontakt/?odeslano=1' });
    return res.end();
  }
  return res.status(200).json(json);
}
