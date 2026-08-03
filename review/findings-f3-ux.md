# web-1P — fáze 3 UX audit

Pozitiva: 0× color-contrast na 347 stranách, skip-link, no-JS fallback reveal správně (html.js + failsafe), breadcrumby do 6. úrovně, 0 rozbitých interních odkazů, jedno CTA na obrazovku, DS drží i na migrovaném obsahu.

P0 | 5 stran s iframe (prumkathon-2021…) | overflow +217px @375 — iframe width=560 přetéká | .prose :global(iframe){max-width:100%;width:100%;aspect-ratio:16/9;height:auto} | [...path].astro:164
P1 | desktop >880px | Desktop nav NEMÁ /skoleni/ ani /ai-agenti/; hamburger jen ≤880px s jiným seznamem — dvě IA dle šířky | sjednotit Nav.astro:4-10 se SiteMenuOverlay.astro:4-15
P1 | /marketing/ | 4 názvy téže sekce (Nav:7, Overlay:6, Footer:10, site.json label) | jeden název všude
P1 | /marketing/, blog uzly | hardcoded „Zobrazit referenci →" na kartách služeb/rubrik | prop ctaLabel dle node.type | ShowcaseCard.astro:22, [...path].astro:130, SectionRoot.astro:52
P1 | 3 páry URL | duplicitní title (seo, trendy-v-seo, analyza-klicovych-slov) | při kolizi přidat label rodiče | [...path].astro:36-39
P1 | 3 stránky | axe frame-title — iframy z migrace bez title | doplnit v cleanMigratedContent | migrated-content.ts:99
P1 | blog/skoleni/ai-ve-firmach… | mrtvý Google Form staré akce, 3× ERR v konzoli | odstranit iframe ze site.json, nahradit odkazem na /kontakt/
P1 | 12 referencí (ISSUES:176-187) | aside „Web klienta" → mrtvé/401 weby | odstranit ext v site.json u dotčených
P2 | ~150 stran | meta desc <120 z node.intro | rozšířit intro v site.json (obsahová práce)
P2 | 9 uzlů | empty-heading z migrace | regex strip v migrated-content.ts:99
P2 | mobil | hamburger jen s JS; overlay bez focus trapu | focus() + trap; details fallback | SiteMenuOverlay.astro:34-55
P2 | všechny | textové odkazy bez branded focus | a:focus-visible outline lime-700 | tokens/base.css:29
P2 | /weby/ /eshopy/ | „Další v této sekci" = holé odkazy bez kontextu | ListCard s kind | SectionRoot.astro:71-78
P2 | /marketing/ | dítě /blog/akce-a-prednasky/ přenese do Blog větve | odebrat z children v site.json
P2 | / | „AI aplikace" i „AI agenti" → /ai-agenti/; „Novinka →" není akční | odlišit cíle; „Více →" | index.astro:8,11
P2 | karty | img alt={name} duplikuje h3 | alt="" | ShowcaseCard.astro:15
P2 | /kontakt/ | checkboxy bez fieldset/legend | obalit | kontakt/index.astro:60-64
P2 | /hry/melounovy-lovec | meta-viewport zákaz zoomu, 2×H1, bez desc/canonical | opravit / noindex | public/hry/
