# Měření poptávek a týdenní report — web První pozice

Kolik poptávek web přinese, kde se na to podívat a jak přijde týdenní souhrn e-mailem.
Založeno 2026-07-28.

> **Stav: nasazeno a ověřeno 2026-07-28.** Proměnné ve Vercelu nastavené, Upstash Redis
> připojený, dashboard běží, `/etc/web-1p-report.env` vytvořený a řádek v **root** crontabu
> zapsaný. Ruční spuštění i volání endpointu prošlo, testovací e-maily dorazily.
> První automatický běh: pondělí 3. 8. 2026 v 7:05.

Z čeho se to skládá:

| Část | Kde běží | Co dělá |
|---|---|---|
| `api/contact.js` | Vercel | po odeslání poptávky zapíše anonymní záznam do úložiště |
| `api/statistiky.js` | Vercel | dashboard za přihlášením — SEO výkon + přehled poptávek |
| `api/tydenni-report.js` | Vercel | pošle týdenní souhrn e-mailem přes Resend (vč. SEO bloku) |
| `api/seo-data.js` | Vercel | přijme denní SEO snapshot z VPS a uloží ho do úložiště |
| `scripts/tydenni-report.sh` | VPS (cron) | jednou týdně zjistí verze Astra a zavolá report |
| `scripts/seo-report.py` | VPS (cron) | denně stáhne data z Search Console a pošle snapshot |

E-mail odesílá vždy Vercel — klíč k Resendu je jen tam, na serveru k němu není přístup.
Server dodává pouze údaje o verzích Astra.

## Co se měří

U každé **úspěšně odeslané** poptávky se uloží čtyři údaje:

- `cas` — časové razítko (ISO, UTC),
- `zajem` — zaškrtnutá políčka „O co máte zájem?",
- `vstup` — vstupní stránka z `document.referrer`: u vlastního webu jen cesta (`/weby/`),
  u cizího zdroje jen doména (`www.google.com`), bez referreru `přímý vstup`,
- `spam` — příznak, že filtr označil poptávku jako možný spam.

Drží se **posledních 500 záznamů** (Redis list `poptavky`, `LPUSH` + `LTRIM`).

## Co se záměrně NEMĚŘÍ

- **Žádné osobní údaje**: jméno, firma, e-mail, telefon ani text zprávy se do statistiky nedostanou
  (ty jsou pouze v e-mailu, který přijde do schránky).
- **Žádné cookies, žádné IP adresy, žádný tracking návštěvníků.** Neměří se návštěvnost,
  jen odeslané poptávky — proto není potřeba souhlas s cookies ani cookie lišta.
- Neměří se ani nic, co by šlo spojit s konkrétní osobou; záznamy jsou nespojitelné statistické čárky.

Zápis statistiky je **fire-and-forget**: když úložiště nefunguje nebo není nastavené,
poptávka se normálně odešle e-mailem a jen se do logu zapíše, že statistika neprošla.
Formulář se kvůli statistice nikdy nerozbije.

## Proměnné prostředí ve Vercelu

Vercel → projekt `web-1P` → **Settings → Environment Variables** (prostředí *Production*,
u tokenů zaškrtnout **Sensitive**). Nic z toho nepatří do gitu.

| Proměnná | K čemu | Odkud |
|---|---|---|
| `STATS_PASSWORD` | heslo k dashboardu | vymyslet silné heslo (např. `openssl rand -base64 24`) |
| `REPORT_SECRET` | tajemství pro volání reportu z VPS | vygenerovat: `openssl rand -hex 32` |
| `KV_REST_API_URL` | adresa úložiště | doplní Vercel sám při připojení KV, nebo z Upstash konzole |
| `KV_REST_API_TOKEN` | token úložiště | dtto |

Místo `KV_REST_API_*` fungují i `UPSTASH_REDIS_REST_URL` a `UPSTASH_REDIS_REST_TOKEN`
(kód zkouší obě sady) — hodí se, když se úložiště zakládá přímo v Upstashi.

**Úložiště (Upstash Redis):**

1. Vercel → záložka **Storage** → *Create Database* → **Upstash for Redis** (stačí free tier;
   ukládáme stovky krátkých řádků).
2. Databázi **Connect** k projektu `web-1P` → Vercel do projektu sám doplní `KV_REST_API_URL`
   a `KV_REST_API_TOKEN`.
3. Alternativa bez Vercel Storage: založit databázi na [upstash.com](https://upstash.com),
   z detailu zkopírovat *REST URL* a *REST TOKEN* a vložit ručně jako `KV_REST_API_URL`
   a `KV_REST_API_TOKEN`.

Už existující proměnné (`RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO`) používá i report — nic se u nich nemění.

**Po přidání proměnných je nutný nový deploy** (Vercel → Deployments → *Redeploy*),
proměnné se do běžících funkcí samy nepropíšou.

## Dashboard

**https://www.prvni-pozice.com/api/statistiky**

- Přihlášení: HTTP Basic. **Uživatelské jméno je libovolné** (třeba `zdenek`),
  heslo = hodnota `STATS_PASSWORD`.
- Sekce **SEO výkon** (data z Search Console, denní snapshot z VPS): kliky/imprese/CTR/pozice
  za 28 dní se srovnáním, vývoj po měsících, příležitosti s nízkým CTR, nové a ztracené dotazy,
  dotazy na pozicích 4–10, top dotazy a stránky, týdenní kontrola indexace vs. sitemap
  a sekce pro platform properties (zatím z CSV exportů).
- Sekce **Poptávky**: počty za 7 a 30 dní (se srovnáním s předchozím týdnem), rozpad podle zájmu,
  nejčastější vstupní stránky a tabulka posledních 50 záznamů.
- Světlý i tmavý režim podle nastavení systému.
- Stránka je `noindex` + `no-store`, takže se nedostane do vyhledávačů ani do cache.
- Když chybí `STATS_PASSWORD`, vrací 503 a nic nezobrazí — bez hesla dashboard nikdy neběží.

## Týdenní e-mail

Report se **neposílá sám** — spouští ho cron na VPS, který zároveň dodá verze Astra.

Na serveru:

1. Uložit tajemství (stejná hodnota jako `REPORT_SECRET` ve Vercelu):

   ```bash
   sudo sh -c 'echo "REPORT_SECRET=<sem to tajemstvi>" > /etc/web-1p-report.env'
   sudo chown root:root /etc/web-1p-report.env
   sudo chmod 600 /etc/web-1p-report.env
   ```

   Soubor `/etc/web-1p-report.env` **není a nesmí být v gitu**.

2. Crontab (root, ať je čitelný `/etc/web-1p-report.env`) — `sudo crontab -e`,
   jednou týdně v pondělí ráno:

   ```
   5 7 * * 1 /data/bot/web-1P/scripts/tydenni-report.sh >> /var/log/web-1p-report.log 2>&1
   ```

Skript projde `/data/bot/*/package.json`, u každého projektu vytáhne verzi `astro`
(z `dependencies` i `devDependencies`), porovná **hlavní verzi** s aktuální z npm registry
a výsledek pošle POSTem na `/api/tydenni-report`. Vercel z toho sestaví e-mail
(předmět `[1P web] Týdenní souhrn — N poptávek`) a pošle ho na `MAIL_TO`.
Projekty, které nejsou na aktuální hlavní verzi, jsou v mailu červeně jako *zastaralé*.

## SEO data (denní snapshot z VPS)

Dashboard i SEO blok v mailu čtou snapshot z úložiště (klíč `seo`). Plní ho
`scripts/seo-report.py` na VPS — service account klíč ke GSC je jen tam
(`/home/admin/.config/gsc/key.json`), do Vercelu se nedává.

- **Denní cron (root, kvůli `/etc/web-1p-report.env`):**

  ```
  50 6 * * * /usr/bin/python3 /data/bot/web-1P/scripts/seo-report.py >> /var/log/web-1p-seo.log 2>&1
  ```

  Běží před pondělním mailem (7:05), takže mail má vždy čerstvá data.
- **Indexace**: v pondělí (nebo s `--indexace`) skript projde všechny URL ze sitemap přes
  URL Inspection API (~350 URL, kvóta 2000/den) a přidá stav indexace. Pokles pod 90 %
  ukáže dashboard i mail jako alert.
- **Autentizace**: stejné tajemství jako týdenní report (`REPORT_SECRET`), POST na
  `/api/seo-data` s hlavičkou `Authorization: Bearer …`.
- **Platform properties** (ChatGPT apod.): API je zatím nenabízí. CSV export z GSC se nahraje do
  `data/gsc-platformy/<platforma>/` (složka není v gitu) a další běh skriptu ho propíše
  do dashboardu. Až API platform properties zpřístupní, přepne se to na automatiku.
- **Ladění bez POSTu**: `python3 scripts/seo-report.py --soubor /tmp/seo.json` — jen vypíše JSON.

## Jak si to ověřit

1. **Úložiště a dashboard**: otevřít https://www.prvni-pozice.com/api/statistiky —
   musí vyskočit přihlášení; po zadání hesla se ukáže stránka se statistikami
   (na začátku prázdná: „Zatím žádné poptávky.").
2. **Zápis poptávky**: odeslat testovací poptávku přes /kontakt/ a dashboard obnovit —
   do tabulky přiskočí nový řádek s časem, zájmem a vstupní stránkou.
   V řádku **nesmí být** jméno ani e-mail; ty jsou jen v doručeném e-mailu.
3. **Špatné heslo**: dashboard musí vrátit 401 a znovu se zeptat.
4. **Report ručně** (ze serveru, ověří i tajemství i doručení mailu):

   ```bash
   sudo /data/bot/web-1P/scripts/tydenni-report.sh
   ```

   Skript vypíše seznam projektů s verzemi a `HTTP 200`; do schránky přijde e-mail.
   Když tajemství nesedí, vrátí `HTTP 401` a skript skončí chybou.
5. **Ochrana reportu**: `curl -si -X POST https://www.prvni-pozice.com/api/tydenni-report`
   bez hlavičky musí vrátit `401`.
6. **Log cronu**: `tail -n 30 /var/log/web-1p-report.log` po prvním pondělí.

## Pozn. k údržbě

- Úložiště drží jen 500 posledních poptávek. Pro delší historii by bylo potřeba archivovat
  (dnes ne — free tier a jednoduchost).
- Dashboard i report čtou stejná data přes `api/_uloziste.js`. Soubory v `api/` začínající
  podtržítkem Vercel nepřevádí na funkce, je to jen sdílený modul.
- Žádná npm závislost — Upstash se volá REST API přes obyčejný `fetch`.
