// Vercel serverless funkce — kontaktní formulář web-1P → Resend API.
// Env proměnné (Vercel → Settings → Environment Variables, NIKDY v gitu):
//   RESEND_API_KEY   MAIL_FROM   MAIL_TO
// Pozn.: MAIL_FROM musí být na doméně OVĚŘENÉ v Resendu; jinak použij onboarding@resend.dev.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // tělo: JSON (fetch) i urlencoded (nativní form bez JS)
  let data = req.body;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = Object.fromEntries(new URLSearchParams(data)); }
  }
  data = data || {};

  // honeypot — bot vyplní skryté pole → tvař se úspěšně, nic neodesílej
  if (data.company_web) return respond(req, res, { ok: true });

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!name || !emailOk || !data.souhlas) {
    return res.status(400).json({ ok: false, error: 'Vyplňte prosím jméno, platný e-mail a souhlas.' });
  }

  const zajem = Array.isArray(data.zajem) ? data.zajem.join(', ') : String(data.zajem || '');
  const text = [
    `Jméno:   ${name}`,
    `Firma:   ${data.firma || '—'}`,
    `E-mail:  ${email}`,
    `Telefon: ${data.tel || '—'}`,
    `Zájem:   ${zajem || '—'}`,
    '',
    'Zpráva:',
    String(data.zprava || '—'),
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
        reply_to: `${name} <${email}>`,       // odpověď míří rovnou tazateli
        subject: `Nová poptávka z webu — ${name}${data.firma ? ' (' + data.firma + ')' : ''}`,
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
