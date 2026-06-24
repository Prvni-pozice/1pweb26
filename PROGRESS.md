# web-1P — krokový log postupu

> Průběžný zápis. Aktualizuje se po každém kroku (požadavek zadavatele 2026-06-24).
> Cíl: nový hlavní web 1P v Astru z design systému + migrace obsahu z prvni-pozice.com.

## Provoz
- Node 22 nutný: `nvm use 22` (viz `.nvmrc`). Default systému je 20 → na něm Astro 7 nebuildí.
- Dev: `npm run dev` → port 4330. Build: `npm run build`.
- Design systém: claude.ai/design projekt `193bd4d3-3da1-463e-89bf-92782cd946df` (re-sync přes DesignSync).

## Hotové kroky

### 2026-06-24
1. **Analýza vstupů** — sitemap `prvni-pozice.com/sitemap.xml` = 343 URL (ploché `/cs/<id>-<slug>/`). Design systém přečten (tokeny, komponenty, `ui_kits/website`, BRIEF).
2. **Scaffold** — `/data/bot/web-1P/`: Astro static + sitemap, `package.json` (port 4330), `astro.config.mjs` (site = prvni-pozice.com).
3. **Design systém nadropnut** — `public/styles.css` + `public/tokens/{fonts,colors,typography,spacing,effects,base}.css` + loga `public/assets/logo-1p-{dark,white}.png` (staženo z claude.ai/design).
4. **Layout + komponenty** — `Base.astro` (head, canonical, OG, globální `.wrap`/`.btn`/`.section`), `Nav.astro` (frosted sticky), `Footer.astro` (tmavý).
5. **Homepage** — `src/pages/index.astro` dle `ui_kits/website`: hero (rank „1"), services grid (6 karet, limetková AI), tmavý AI band se stepy + stats, lime CTA. Hero vizuál = placeholder.
6. **Build #1 zelený** — opraven pád sitemapy (verzový nesoulad s Astro 4).
7. **Git** — `git init`, secret scan čistý, commit `2a5d090`.
8. **Upgrade Astro 7 + Node 22** — `.nvmrc`, sitemap 3.7.3. Build zelený. Commit `f932ddf`.

### 2026-06-24 — Rozhodnutí o migraci (zadavatel)
- **URL:** clean slugy + 301 redirecty.
- **Rozsah:** nejdřív pilot 5–10 stran na schválení směru, pak zbytek.
- **Media:** stáhnout vše as-is.

### 2026-06-24 — Pilot
9. **Scraping recept** — starý web (CMS) vrací 404 bez správných hlaviček; funguje s `-A "Mozilla/5.0 (Macintosh…)" -H "Referer: …/cs/" -L`.
10. **Kategorie e-shopy** — naparsováno 18 referenčních kartiček (`.category-frame`: id, název, bullety, obrázek `kat-pic/1920/<id>.jpg`) → `src/data/eshopy.json`. Staženo 18 obrázků (1.8 MB) do `public/img/eshopy/`.
11. **`/eshopy/`** — nová DS kategorie: hero, 4 feature body, grid 18 `ShowcaseCard` (full-bleed obrázek, tmavý gradient, hover lift + lime CTA) = „kartičky s grafickým efektem" v novém pojetí.
12. **`/reference/[slug]/`** — dynamická šablona, 18 stran z dat (hero obrázek, body, CTA aside). Plný obsah detailů → hlavní migrace.
13. **301 redirecty** — `vercel.json`, 38 pravidel (eshopy + 18 referencí, s/bez trailing slash).
14. **Build zelený: 20 stran.** Dev server na http://116.203.103.27:4330/ (port 4330). **STOP — čeká schválení směru pilotu.**

### 2026-06-24 — Plná migrace: reference + kategorie (schváleno „zpracuj vše")
15. **Bulk download** — všech 343 stran sitemapy staženo lokálně do `scratchpad/pages/` (recept: realistická UA + Referer). Offline analýza `analysis.json`.
16. **Klasifikace referencí** — union dvou metod: featured kartičky kategorií (11-weby/12-eshopy/13-propagace, mají `kat-pic` thumbnail) ∪ detekce přes externí odkaz na web klienta + title „Klient – služba". Výsledek **103 klientských referencí**: 59 weby, 26 eshopy, 17 marketing, 1 aplikace. (Archiv vyřešen tím, že reference jsou samostatné stránky v sitemapě — AJAX load-more netřeba.)
17. **Thumbnaily** — 100/103 staženo (`kat-pic/1920/<id>.jpg`) do `public/img/reference/`; 5 bez thumbnailu → brandovaný placeholder (iniciála na tmavé).
18. **Kategorie data-driven** — `categories.json` + `CategoryPage.astro` (hero + feature body + grid + CTA) → tenké stránky `/weby/`, `/eshopy/`, `/marketing/`.
19. **E-shop grafika** — staženy 4 velké feature grafiky (001–004) + hero; sekce „Na čem si zakládáme" (grafika + hesla) **pod výpisem referencí** na `/eshopy/` (`eshop_graphics.json`).
20. **Detail reference** — `/reference/[slug]` z `references.json` (103 stran): popis, bullety, odkaz na web klienta, CTA aside.
21. **Navigace** — Nav + homepage služby napojeny na `/weby/ /eshopy/ /marketing/`.
22. **301 mapa** — `vercel.json` 214 pravidel (kategorie + 103 referencí + `/cs`, s/bez trailing slash).
23. **Build zelený: 107 stran.**

## Zbývá
- **Hlavní nav stránky:** `/o-nas/`, `/kontakt/` (DS má `ui_kits/website/kontakt.html`), `/ai-agenti/`, `/skoleni/` — zatím 404.
- **Obsahové stránky** (~240 zbývajících URL): SEO články, blog (`248-blog`), pojmy/diskuze, info stránky, servisní (status, ochrana údajů). → rozhodnout rozsah.
- Doplnit 301 pro tyto zbývající URL.
- GitHub remote. Footer IČO/DIČ. Homepage slider — reálné obrázky.
