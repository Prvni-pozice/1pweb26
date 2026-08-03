# FINDINGS — web-1P, fáze 0–4

> Stav k 3. 8. 2026: fáze 0–4 dokončeny, opravná fáze zatím NEPROBĚHLA.
> Detail per fáze: `findings-f1-integrita.md`, `findings-f2-zakaznik.md`, `findings-f3-ux.md`, `findings-f3-copy.md`, `findings-f4-konkurence.md`
> Fáze 0: 347 stran, 187 řádků nálezů (`ISSUES.md`) — dominují krátké meta descriptions u referencí a 3 duplicitní titulky.

## P0 — blokuje předání

| # | Stránka | Fáze | Nález | Oprava |
|---|---|---|---|---|
| 1 | /zasady-ochrany-udaju/ | 1 | Chybné DIČ „CZ29136342" — všude jinde správně CZ29136334 | opravit | 
| 2 | všechny | 1 | Google Analytics (G-5XDVHLWRP4) se načítá bez souhlasu, na webu není cookie lišta; zásady deklarují „oprávněný zájem", ale analytické cookies vyžadují opt-in (§ 89/3 zák. 127/2005 Sb.) | consent lišta + Consent Mode v2, nebo cookieless měření a úprava zásad |
| 3 | 5 stran s vloženým videem | 3 | Vodorovný overflow +217 px na 375 px — `iframe width=560` přetéká, stránka jde do stran | `.prose :global(iframe){max-width:100%;width:100%;aspect-ratio:16/9;height:auto}` v `[...path].astro:164` |
| 4 | /kontakt/ | 2 | Formulář v testovacím průchodu vrátil 404 a hlášku „Něco se pokazilo" | **ověřit na Vercelu** — `astro preview` neobsluhuje API routes, může jít o artefakt lokálního běhu (fáze 1 potvrdila, že `api/contact.js` s Resend existuje) |
| 5 | celý web | 2 | Nikde cena ani orientační rozpětí a nikde průběh zakázky — scénář „kolik to stojí a jak to probíhá" končí slepě | sekce „Jak spolupráce probíhá" (4 kroky) + cenová orientace |

## P1

| # | Stránka | Fáze | Nález | Oprava |
|---|---|---|---|---|
| 6 | patička | 1 | Chybí sídlo, spisová značka a rejstříkový soud (§ 435 NOZ) | doplnit po ověření v OR (📋 otázka) |
| 7 | patička | 1+3 | Žádný odkaz na /zasady-ochrany-udaju/ (jediný vstup je checkbox ve formuláři) | přidat |
| 8 | JSON-LD | 1 | `ProfessionalService` bez `address` | doplnit PostalAddress |
| 9 | 3 páry URL | 0+1 | Duplicitní `<title>` — ale NEJDE o duplicitní obsah (hub vs článek stejného jména), canonical/301 by byl chybný | při kolizi labelů přidat rodiče do titulku (`[...path].astro:36-39`) |
| 10 | 4× /blog/akce-a-prednasky/ | 1 | Mrtvé obrázky `/UserFiles/Image/prednasky…` → 404 | odstranit v `cleanMigratedContent` nebo dostáhnout |
| 11 | /, /o-nas/ | 1 | „15+ let na trhu" — IČO odpovídá zápisu ~2011/2012, tj. 14 let | 📋 potvrdit rok založení |
| 12 | / | 1 | „3× rychlejší prototyp" — nepodložené číslo | 📋 potvrdit, nebo „prototyp za dny, ne měsíce" |
| 13 | / | 1 | Trust bar „Důvěřují nám": Diton, TLC, Ciret, Ostendorf-Osma, Synpro nemají na webu referenci | 📋 potvrdit klientství a právo užít logo |
| 14 | desktop >880 px | 3 | Desktopová navigace nemá /skoleni/ ani /ai-agenti/; hamburger (jen ≤880 px) má jiný seznam — dvě různé architektury podle šířky | sjednotit `Nav.astro` a `SiteMenuOverlay.astro` |
| 15 | /marketing/ | 2+3 | Čtyři názvy téže sekce: „Marketing" / „GEO a marketing" / „SEO a marketing" / „Online marketing" | jeden název všude |
| 16 | /marketing/, blog | 3 | Karty služeb a rubrik mají natvrdo „Zobrazit referenci →" | prop `ctaLabel` podle typu uzlu |
| 17 | 3 stránky | 3 | `frame-title` — vložené rámy z migrace bez popisku | doplnit v `cleanMigratedContent` |
| 18 | /blog/skoleni/ai-ve-firmach… | 3 | Vložený Google Form k dávno proběhlé akci, 3× chyba v konzoli | odstranit, nahradit odkazem na /kontakt/ |
| 19 | 12 referencí | 3 | Odkaz „Web klienta" vede na neexistující nebo chráněné weby | odstranit `ext` u dotčených uzlů |
| 20 | /weby/ | 2 | 68 karet v jednom sloupci (~20 500 px na mobilu), bez filtru | filtr podle oboru + stránkování |
| 21 | /weby/, /eshopy/ | 2 | Náhledy referencí jsou na mobilu skoro černé (tmavý překryv) | zesvětlit překryv |
| 22 | mobilní menu | 2 | Pořadí: AI školení první, Kontakt uprostřed | přeřadit, Kontakt zvýraznit |
| 23 | patička | 2 | „Reference" vede jen na /weby/ | přejmenovat nebo vytvořit rozcestník |
| 24 | detaily referencí | 2+4 | Reference bez měřitelných výsledků (konkurence ukazuje čísla) | 2–3 case studies s metrikami |
| 25 | /ai-agenti/ | 2 | Blogové upoutávky v technickém žargonu na stránce pro podnikatele | kurátorovat byznysové články |
| 26 | /skoleni/ | 2 | Chybí formát, délka a cena školení | doplnit (📋 podklady) |
| 27 | /kontakt/, /skoleni/, /ai-agenti/ | 3 | Meta descriptions 87 / 119 / 113 znaků | finální texty v `findings-f3-copy.md` |
| 28 | ~150 stran | 0+3 | Meta description pod 120 znaků (generuje se z `node.intro`), `slice(0,155)` řeže uprostřed slova | nový generující vzorec |
| 29 | celý web | 3 | CHYBÍ stránka 404 (`src/pages/404.astro` neexistuje) | vytvořit |
| 30 | /ai-agenti/ | 3 | H1 tyká, zbytek webu vyká | „Nechte agenta napsat první verzi." |
| 31 | více míst | 3 | „jde vidět" (nespisovné), „načtení během milisekund" (nereálné tvrzení) | opravy v `findings-f3-copy.md` |
| 32 | / | 3 | Chybí nezlomitelné mezery v klíčových nadpisech | doplnit |
| 33 | /ai-agenti/ | 4 | Nabídka bez deliverable a časového rámce (konkurence uvádí „pilot 2–4 týdny") | doplnit trvání a výstup |

## P2 (výběr)

Prázdná plocha na /ai-agenti/ (lazy-load bez placeholderu); hamburger nefunguje bez JS a nemá focus trap; textové odkazy bez branded fokusu; „AI aplikace" i „AI agenti" vedou na stejnou URL; `img alt` duplikuje nadpis karty; checkboxy formuláře bez `fieldset/legend`; hra v `/public/hry/` zakazuje zoom a má 2× H1; „Na úlehli" → „Na Úlehli"; číslo účtu s mezerami kolem lomítka; sjednotit „AI & agenti"/„AI a agenti"; rozhodnout em dash vs en dash.

## Poznámka k PROGRESS.md

Sekce „Zbývá" je zastaralá: migrace ~240 URL už proběhla (347 stran), formulářový backend není placeholder (`api/contact.js` + Resend, honeypot, rate-limit), footer video je záměrný CSS fallback. Aktualizovat.

## Fáze 4 — verdikt

Konkurence: Webforte, Apertia.ai, eVisions. Měřitelně první jsme v rychlosti (56 kB homepage proti 181–332 kB), v počtu jmenovaných referencí a v AI-first pozicování celé firmy včetně kategorie „rapidní vývoj s agenty", kterou nemá nikdo. **Jediná změna s největším dopadem: 2–3 case studies s čísly** — 80+ referencí bez jediného výsledku působí slaběji než konkurent se 47 projekty, který říká „+561 %".
