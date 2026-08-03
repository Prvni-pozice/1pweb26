# web-1P — fáze 3 copywriting

P1 meta (finální):
- /kontakt/ (87→144): „Nezávazná konzultace zdarma — ozveme se do 24 hodin. Zavolejte na +420 775 387 231 nebo pošlete poptávku a rovnou řekneme, kde vám AI dá náskok." | kontakt/index.astro:31
- /skoleni/ (119→157): „Praktické AI školení pro majitele a manažery firem. Lektor vede, vy rovnou tvoříte — odcházíte s hotovými výstupy, ne s poznámkami. Termín i obsah podle vás." | skoleni/index.astro:11
- /ai-agenti/ (113→147): „Tvoříme AI aplikace a nasazujeme agenty do komunikace, vývoje i provozu. Od nápadu k funkčnímu prototypu za dny. Řekneme i to, kde AI smysl nedává." | ai-agenti/index.astro:24
- reference /weby/ /eshopy/: vzorec v [...path].astro:54+:88 — intro <120 → doplnit sekční sufix („Reference tvorby webů — agentura První pozice, 15+ let zkušeností."), ořez na hranici slova místo slice(0,155)

P1 copy:
- ai-agenti H1 tyká → „Nechte agenta napsat první verzi." | ai-agenti:28
- „jde vidět" 2× → „je vidět v číslech" | categories.json:38, index.astro:10
- „během milisekund" 2× → „do sekundy…" | categories.json:26, eshop_graphics.json:5
- navigace 3 názvy marketingu → sjednotit „Online marketing"/„Marketing", GEO z overlay pryč | SiteMenuOverlay.astro:6
- „Na úlehli" → „Na Úlehli" | kontakt:26
- slib do 24 h jen v meta; 3× „rychle" → bullet „Reakce do 24 hodin…" | kontakt:40
- CHYBÍ 404.astro → vytvořit: H1 „Tahle stránka není ani na první pozici." + text + CTA | src/pages/404.astro
- nbsp: „Teď i&nbsp;s&nbsp;AI." (index:47), „už&nbsp;15&nbsp;let." (o-nas:21), „s&nbsp;AI." (index:104), „z&nbsp;vašeho" (index:122, o-nas:64)

P2: hero H1 NEPŘEPISOVAT; „dřív než kdy dřív" → „Funkční verzi máte v ruce během prvního týdne." (index:17, ai-agenti:14); „na míru" vata (kontakt:41, categories.json:6,10,22,29, ai-agenti:18); skoleni „Design systém jako jádro" → „Postavíte si design systém"+desc (skoleni:7); overline/H2 prohozené (skoleni:23); „Rychlé, čisté" opakování (index:9); „Novinka →" → akční (index:8); AI aplikace+AI agenti stejná URL → kotvy (index:8,11); marketing CTA „postavit" → „rozjet růst" (SectionRoot:83); „lokální agentura" bez místa → „z Vysočiny (Pelhřimov)" ověřit (o-nas:22); účet bez mezer (kontakt:28); label „Jméno a příjmení" + placeholder tel (kontakt:56,59); hříčka První/první pozice — vědomé pravidlo OK (kontakt:137); slider alt sjednotit (HeroSlider:7); „Posouváme týmy v práci s AI." (HeroBanner:19); patička „o&nbsp;krok" + pořadí služeb (Footer:36); patička: přidat odkaz Zásady (Footer:26); pomlčka — vs – globální rozhodnutí; „AI & agenti" vs „AI a agenti" (Footer:16, Overlay:12); gridTitle mrtvá data — rozhodnout (SectionRoot:15-19 vs categories.json:15,31)

Bez nálezu: uvozovky, tisíce, ×, diakritika, mikrotexty formuláře, VideoFooter nbsp, kontakty konzistentní.
