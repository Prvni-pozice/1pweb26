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

### 2026-06-24 — Hlavní nav stránky
24. `/kontakt/` (DS předloha + reálný kontakt: Václav Tůma, +420 775 387 231, podpora@prvni-pozice.com, IČO 29136334 / DIČ CZ29136334), `/o-nas/`, `/ai-agenti/`, `/skoleni/`. Nav + Footer napojeny. **Form backend = TODO** (placeholder Formspree).

### 2026-06-24 — Iterace 1+2 (vylepšení, inspirace GEO web)
25. **AI hero** `AiHeroVisual.astro` — živá „agentní neuronová síť" (SVG uzly + pulzující spoje + putující pakety + scan line), reduced-motion safe.
26. **motion.js** — reveal on scroll + pointer-glow karet + scroll-scrub video (technika z GEO `CrowdVideo`).
27. **Video patička** `VideoFooter.astro` nad footerem — CSS „data horizon" fallback (funguje hned), slot `<video data-scrub>` pro generovaný klip.
28. Card efekty: lime glow + reveal na služby/reference, lime ring na hover.

### 2026-06-24 — Výkon + bezpečnost
29. **Obrázky:** 123× WebP ~900px (sharp), 24 MB → ~3 MB. CLS řešen aspect-ratio kontejnery.
30. **Fonty:** Roboto + Roboto Mono self-hosted (`@fontsource`), **0 Google Fonts requestů**, žádný render-blocking `@import`. JS ~4 KB/stránku.
31. **Security:** secrets ČISTÉ, externí odkazy `rel=noopener noreferrer`, `set:html` jen z důvěryhodných zdrojů, scrapnutý obsah escapovaný text → bez XSS.

### 2026-06-25 — STRUKTURNÍ REBUILD (oprava: zrcadlit reálný strom, ne heuristika)
Zpětná vazba zadavatele: `/marketing/` měly být SLUŽBY (ne reference), blogové články (`technicky-audit-seo-5`) spadly omylem do `/reference/`, část referencí ve špatné kategorii. Řešení = **zrcadlit skutečnou hierarchii starého webu** + opravit breadcrumbs všude + hamburger menu.
- **Strom z breadcrumbs** (`scratchpad/sitetree.json`, `site.json`): 334 uzlů, hloubka až 6. Hlavní sekce: Weby(90), E-shopy(45), SEO a marketing(31, =SLUŽBY), Blog(158), 1P(3), Grafika(1).
- **Obsahový kontejner = `<main>`** (breadcrumb na začátku odstranit, pak h1+tělo; `.description` je jen kontakt-sidebar). Karty dětí = `.category-frame`.
- **Nested clean cesty** mirror stromu: `/blog/online-marketing/seo/pojmy-v-seo/<článek>/`. Section-root sluggy: weby/eshopy/marketing/blog/o-nas/grafika.
- TODO render-engine: catch-all `[...path].astro` z `site.json` (breadcrumbs + obsah + grid dětí/rozcestník + reference treatment), `Hamburger` menu dle stromu, stáhnout obsahové obrázky `/UserFiles/`, přepsat interní odkazy a img src, 301 z `/cs/<id>-slug/` → nested cesta, odstranit staré hardcoded /weby|eshopy|marketing|reference. Kontaktní form backend = ČEKÁ na volbu (Web3Forms/Formspree/Vercel+Resend/mailto).

### 2026-06-25 — STRUKTURNÍ REBUILD HOTOV (catch-all)
- **`src/data/site.json`** = 329 uzlů (path → {label, parent_path, children, content, intro, thumb, ext, type}). Obsah z `<main>` sanitizován (pryč breadcrumb/karty/script/style/on*=/javascript:), interní odkazy a img přepsány na nové cesty.
- **`[...path].astro`** catch-all renderer: breadcrumbs + h1 + obsah (`set:html` z 1st-party starého webu) + grid dětí (reference=`ShowcaseCard` jen pod /weby /eshopy; ostatní=`ListCard` rozcestník) + reference aside (web klienta + CTA).
- **`Breadcrumbs.astro`** z reálné hierarchie (parent_path řetěz). **`Hamburger.astro`** vpravo nahoře = menu se strukturou (sekce → děti), overlay + ESC/klik zavřít.
- Staré hardcoded `/weby /eshopy /marketing /reference` + `CategoryPage` ODSTRANĚNY → vše tree-driven.
- 74 obsahových obrázků staženo → `public/img/content/` (webp).
- **301 mapa**: `vercel.json` 676 pravidel z 334 starých URL → nested cesty.
- **Build 334 stran zelený.** Opraveno: `/marketing/`=služby (ListCard), `/eshopy/`=reference (ShowcaseCard), blog články pod `/blog/...`, staré `/reference/` → 404.

## Zbývá
- **OBSAHOVÉ STRÁNKY ~240 URL** (SEO blog `248-blog`, pojmy-v-seo, seo-diskuze, trendy-v-seo, info/servisní `20-zasady-ochrany-udaju`, status…) — rozhodnuto migrovat 1:1, ZATÍM NEHOTOVO. Všech 343 HTML staženo lokálně ve `scratchpad/pages/` → deterministická dávka.
- **K vygenerování (zadavatel):** footer scrub video `/assets/footer/scrub.mp4` + poster (1920×1080, H.264 all-keyframe `-g 1`, ~15fps, 6–10 s, theme = AI síť/data horizon v limetce), pak `hasVideo=true` v `VideoFooter`. Volitelně ambient hero video.
- **Form backend** `/kontakt/` (Formspree/vlastní endpoint).
- GitHub remote. Reálný 100/100 PageSpeed = ověřit Lighthouse na Vercel preview (lokálně bez headless Chrome neměřitelné).
