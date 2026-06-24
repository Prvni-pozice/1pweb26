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

## Blokované / čeká na rozhodnutí
- **Migrace 343 podstran** — strategie URL (zachovat `/cs/<id>-<slug>/` vs. clean slugy + 301), fidelity obsahu, stažení obrázků/videí. Kategorie-kartičky (`/cs/12-eshopy/`) překlopit do nového designu.
- GitHub remote.
- Footer IČO/DIČ; homepage slider — reálné obrázky.
