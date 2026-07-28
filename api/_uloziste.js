// Sdílené úložiště statistik poptávek — Upstash Redis přes REST API (obyčejný fetch,
// žádná npm závislost). Funguje s Vercel KV i s přímým Upstashem.
// Env (Vercel → Settings → Environment Variables, NIKDY v gitu):
//   KV_REST_API_URL + KV_REST_API_TOKEN   nebo   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// Pozn.: soubory v api/ začínající podtržítkem Vercel nepřevádí na funkce — tohle je jen modul.

export const KLIC = 'poptavky';   // Redis list, nejnovější záznam první
export const MAX_ZAZNAMU = 500;   // kolik posledních poptávek držíme

// Konfigurace úložiště, nebo null když proměnné nejsou nastavené.
export function uloziste() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: String(url).replace(/\/+$/, ''), token: String(token) };
}

export const NENI_ULOZISTE = 'Úložiště není nastavené — chybí proměnné KV_REST_API_URL a KV_REST_API_TOKEN.';

// Dávka příkazů přes REST /pipeline; vrací pole výsledků ve stejném pořadí.
async function pipeline(prikazy, timeoutMs = 3000) {
  const cfg = uloziste();
  if (!cfg) throw new Error(NENI_ULOZISTE);
  const r = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prikazy),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`Úložiště odpovědělo ${r.status} ${body.slice(0, 200)}`);
  }
  const out = await r.json();
  return (Array.isArray(out) ? out : []).map((x) => (x && 'result' in x ? x.result : null));
}

// Zápis jedné poptávky: na začátek listu + ořez na posledních MAX_ZAZNAMU.
export async function zapisPoptavku(zaznam) {
  await pipeline([
    ['LPUSH', KLIC, JSON.stringify(zaznam)],
    ['LTRIM', KLIC, 0, MAX_ZAZNAMU - 1],
  ]);
}

// Načtení všech držených poptávek (nejnovější první); poškozené položky ticho přeskočíme.
export async function nactiPoptavky() {
  const [polozky] = await pipeline([['LRANGE', KLIC, 0, MAX_ZAZNAMU - 1]]);
  return (polozky || [])
    .map((s) => { try { return JSON.parse(s); } catch { return null; } })
    .filter((z) => z && z.cas);
}

// Souhrn za posledních `dny` dní (volitelně posunutý o `posunDnu` do minulosti —
// kvůli srovnání "tento týden vs. minulý týden").
export function souhrn(zaznamy, dny, posunDnu = 0) {
  const den = 24 * 60 * 60 * 1000;
  const doKdy = Date.now() - posunDnu * den;
  const odKdy = doKdy - dny * den;
  const vyber = zaznamy.filter((z) => {
    const t = Date.parse(z.cas);
    return Number.isFinite(t) && t > odKdy && t <= doKdy;
  });

  const zajem = new Map();
  const vstupy = new Map();
  let spam = 0;
  for (const z of vyber) {
    if (z.spam) spam++;
    for (const i of Array.isArray(z.zajem) ? z.zajem : []) zajem.set(i, (zajem.get(i) || 0) + 1);
    const v = z.vstup || 'neuvedeno';
    vstupy.set(v, (vstupy.get(v) || 0) + 1);
  }
  const serad = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);

  return { pocet: vyber.length, spam, zajem: serad(zajem), vstupy: serad(vstupy) };
}

// Escapování do HTML — vstupní stránka i zájem pocházejí ze vstupu uživatele.
export function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Datum a čas v české podobě (server běží v UTC).
export function cesky(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '—';
  return new Date(t).toLocaleString('cs-CZ', { timeZone: 'Europe/Prague', dateStyle: 'short', timeStyle: 'short' });
}
