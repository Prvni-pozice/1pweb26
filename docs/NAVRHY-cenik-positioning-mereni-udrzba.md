# Návrhy k bodům 3, 6, 9 a 10 z CEO reportu

---

# 3. Cenová kotva — kde všude ukázat „od X Kč" a jak postavit ceníkovou podstranu

## Proč vůbec

Majitel SMB má na výběr z pěti agentur a u čtyř nenajde cenu. Ta pátá dostane e-mail — ne proto, že je nejlevnější, ale protože jako jediná nevypadá, že něco skrývá. Cena „od" nesnižuje pozici, pokud je rámovaná. Co ji snižuje, je detailní ceník po položkách, který konkurence okopíruje a který vás ukotví dole.

**Doporučené pravidlo:** všude uvádět jen spodní hranici („od X Kč") a rozpětí typického projektu. Nikdy ne přesné ceny za položky.

## Kde cenu zobrazit (seřazeno podle přínosu)

| Místo | Co tam dát | Proč |
|---|---|---|
| **Nová podstrana `/cenik/`** | Plné rozpětí pro každou službu | Cíl většiny „kolik to stojí" hledání; sem míří i lidé z Googlu |
| **Servisní huby** `/weby/`, `/eshopy/`, `/marketing/`, `/skoleni/`, `/ai-agenti/` | Pruh „Orientačně od X Kč" nad gridem referencí + odkaz na ceník | Návštěvník je právě rozhodnutý, že službu chce |
| **Kontaktní formulář** | Nové pole „Orientační rozpočet" (rozsahy, ne částka) | Kvalifikuje poptávku — ušetří ti schůzky s někým, kdo má 20 tisíc na e-shop |
| **Detail reference** (CTA box vpravo) | „Podobný projekt zvládneme od X Kč" | Nejsilnější moment — právě viděl, co umíte |
| **Hlavní menu** | Položka „Ceník" | Lidé ji hledají; když ji nenajdou, odejdou |

**Kam cenu naopak nedávat:** na karty služeb na homepage. Homepage prodává příběh a náskok s AI; šest čísel pod kartami z toho udělá srovnávač. Odkaz na ceník v menu stačí.

## Struktura podstrany `/cenik/`

Psaná pro majitele firmy, ne pro nákupčího. Pořadí je záměrné — nejdřív odpověď, pak vysvětlení.

1. **Hero: „Kolik stojí web, e-shop nebo AI agent?"**
   Podnadpis přizná realitu rovnou: *„Poctivá odpověď je rozpětí — a tady je. Přesnou cenu řekneme po první schůzce, zdarma a nezávazně."* Tím sundáš obranu z „zase mi neřeknou".

2. **Tři typické projekty u každé služby** — ne „balíčky", ale reálné scénáře:
   - *Prezentace* — od X Kč · pro koho · co obsahuje · obvykle hotovo za N týdnů
   - *Web na míru* — od Y Kč · …
   - *Rozsáhlý web / e-shop* — od Z Kč · …

   Prostřední variantu vizuálně zvýraznit — většina si vybere ji.

3. **„Co cenu posouvá nahoru a dolů"** — 5–6 faktorů: rozsah a počet stran, napojení na sklad/účetnictví/ERP, kdo dodá texty a fotky, migrace ze starého webu, jazykové verze, termín. Tady majitel pochopí, proč nejde říct číslo po telefonu, a přestane to brát jako vytáčku.

4. **Provozní náklady zvlášť** — doména, hosting, správa, aktualizace. SMB majitel na ně zapomíná a pak je z nich nemile překvapený. Když je uvedeš dopředu, kupuješ si důvěru za nulu.

5. **„Co je v ceně vždycky"** — responzivita, rychlost, základní SEO, školení obsluhy, záruka. Ukazuje, že levnější nabídka odjinud nemusí být srovnatelná.

6. **FAQ** — zálohy a splatnost, co když se rozsah v průběhu změní, kdo vlastní zdrojáky, co když nebudu spokojený.

7. **CTA: „Nezávazná kalkulace do 2 pracovních dnů"** — konkrétnější a méně závazně znějící než „domluvit konzultaci".

## Navržená čísla (2026-07-28, k odsouhlasení)

Vychází z rešerše českého trhu, ne z tvých nákladů — ty znáš jen ty. Pozicování: jasně nad segmentem „web za 9 900 Kč", pod pražskými agenturami. Regionální agentura s 15 lety praxe a korporátními klienty (Asekol, Diton, Ciret) má na tuhle hladinu nárok. Vše bez DPH.

**Weby**
| Projekt | Od | Obvyklé rozpětí |
|---|---|---|
| Jednostránková prezentace | 25 000 Kč | 25–45 tis. |
| Firemní web na míru ← vlajkový | 55 000 Kč | 55–120 tis. |
| Rozsáhlý web / portál / vícejazyčný | 150 000 Kč | 150–400 tis. |

**E-shopy**
| Projekt | Od | Obvyklé rozpětí |
|---|---|---|
| E-shop na platformě (Shoptet, Upgates) s vlastním designem | 45 000 Kč | 45–90 tis. |
| E-shop na míru s integracemi | 120 000 Kč | 120–300 tis. |

**Online marketing** — SEO od 9 000 Kč/měsíc · správa PPC od 6 000 Kč/měsíc · jednorázový SEO audit od 18 000 Kč

**AI** — školení týmu od 18 000 Kč/den · AI agent a automatizace od 45 000 Kč · AI aplikace na míru od 90 000 Kč

**Provoz** — doména od 300 Kč/rok · hosting od 500 Kč/měsíc · správa a aktualizace od 1 500 Kč/měsíc · vícepráce 1 200 Kč/hod.

### Proč právě tato čísla

Trh v roce 2026: landing page 10–30 tis., firemní web 30–80 tis., pokročilý web 80–200 tis.; reálný rozpočet SMB na nový web 50–150 tis. E-shop na míru 60–150 tis., s integracemi od 150 tis. výš. SEO měsíčně: lokální firma 8–15 tis., střední web 20–50 tis. Hodinová sazba digitálních agentur kolem 1 450 Kč.

Spodní hranici u firemního webu držím na 55 tis. schválně — je nad polovinou pásma, takže neláká hledače nejnižší ceny, ale zároveň nevyplaší firmu s rozpočtem 80 tis. Hodinovku dávám na 1 200 Kč, tedy mírně pod pražskou úrovní, což odpovídá regionální pozici.

Zdroje rešerše: le-artist.cz, anfilov.cz, webui.cz, web-clever.cz, mipaco.cz, per4mens.cz.

## Co potřebuju od tebe

Odsouhlasit nebo přepsat čísla výše. Jakmile budou potvrzená, vyrobím podstranu do webu podle náhledu.

---

# 6. Sjednotit příběh „lokální agentura + AI"

## Kde to dnes drhne

Homepage, `/ai-agenti/` a `/skoleni/` mluví jedním hlasem: náskok, AI, měřitelnost, konkrétní CTA. Jakmile ale návštěvník klikne do `/marketing/seo/`, `/marketing/geo/` nebo `/marketing/zbozove-servery/`, ocitne se v jiné firmě — texty jsou po copy-editu v pořádku, ale **layout je úplně jiný**. Důvod je technický: `/weby/`, `/eshopy/` a `/marketing/` mají v `categories.json` bohatou šablonu (hero, feature body, grid referencí, CTA), zatímco podřazené huby spadnou do generické šablony pro články — nadpis a odstavec textu.

Návštěvník to nečte jako „jiná šablona". Čte to jako „tahle část webu je odloženáa".

## Návrh ve třech krocích

**Krok 1 — jedna věta, která platí všude.** Definovat větu typu *„Lokální agentura, která staví weby, e-shopy a marketing — a dnes je posouvá dál s AI."* a promítnout ji do úvodu každého servisního hubu. Ne copy-paste, ale stejné vyznění.

**Krok 2 — rozšířit kategorijní šablonu na podřazené huby.** `categories.json` už umí přesně to, co je potřeba. Stačí ho rozšířit o položky pro `/marketing/seo/`, `/marketing/geo/`, `/marketing/zbozove-servery/`, `/marketing/tisk/`, `/marketing/video/`, `/grafika/` a nechat je renderovat stejnou šablonou. Odhaduju půl dne práce a je to největší skok v konzistenci za nejmenší peníz.

**Krok 3 — „AI nit" v každé službě.** Do každého servisního hubu jeden krátký blok: *co konkrétně AI mění právě u téhle služby*. U SEO jiný text než u grafiky. Tím přestane AI působit jako oddělená sekce webu a začne působit jako způsob, jakým děláte všechno.

**Bonus — vizuální sjednocení referencí.** Galerie snímků má dnes jen část prezentačních webů. Dotáhnout na e-shopy a marketingové reference (už je v ToDo). Reference jsou nejnavštěvovanější část webu a zároveň nejnesourodější.

---

# 9. Měřit konverze formuláře

## Problém

Dnes nevíš, kolik poptávek web přinese za měsíc, ze které stránky chodí a o co lidé mají zájem. GA4 to sice měřit může, ale běží bez souhlasu a schválně jsme ho teď nechali být — takže se na jeho čísla stejně nedá spolehnout (adblocky, odmítnuté cookies).

## Návrh: měřit na serveru, ne v prohlížeči

Kontaktní endpoint `/api/contact` už každou poptávku vidí. Stačí, aby si u úspěšného odeslání poznamenal pár neosobních údajů:

- časové razítko
- ze které stránky člověk přišel (`document.referrer` nebo skryté pole s URL)
- zaškrtnuté „o co máte zájem"
- jestli šlo o poptávku, nebo spam

**Žádné jméno, e-mail ani text zprávy** — jen provozní statistika. Tím pádem to nepotřebuje cookie lištu ani souhlas, je to first-party provozní údaj a nezávisí to na adblockách. Měří 100 % poptávek, na rozdíl od GA4.

**Výstup:** týdenní e-mail — *„Tento týden 6 poptávek: 3× web, 2× AI agenti, 1× školení. Nejčastější vstupní stránka: /weby/technocon-s-r-o/."* Na to už se dá reagovat.

**Kam data ukládat:** nejjednodušší je připsat řádek do Vercel logu a jednou týdně ho zpracovat, nebo poslat kopii poptávky na sběrnou adresu a počítat to tam. Pokud budeš chtít historii a grafy, dává smysl malá tabulka (Vercel KV nebo SQLite na tvém VPS — infrastrukturu už máš).

**Doplněk zdarma:** měřit i kliky na telefon a e-mail. Velká část SMB klientů nevyplní formulář a rovnou volá — dnes je to úplně neviditelné.

---

# 10. Pravidelná údržba

## Co kontrolovat a jak často

**Měsíčně (10 minut, dá se zautomatizovat celé):**
- `npm audit` + aktualizace závislostí, build, nasazení
- kontrola rozbitých interních odkazů (skript na to už mám napsaný z dnešní práce)
- Search Console: nové 404, chyby indexace, řetězce redirectů
- rychlost webu (Core Web Vitals) — hlavně po větších obsahových změnách

**Čtvrtletně (hodina, ručně):**
- projít reference — jsou weby klientů ještě živé? Odkaz na zrušený web kazí dojem
- zkontrolovat, jestli sedí kontakty, jména a ceny
- projít ToDo v `docs/TODO.md` a přeskládat priority

**Průběžně:**
- po každém větším zásahu do obsahu ověřit build a namátkou tři stránky

## Jak to zautomatizovat

Máš na to už postavenou infrastrukturu — `vps-setup` posílá HTML maily ze serveru a umí naplánované úlohy. Nabízí se měsíční naplánovaný běh, který projde audit závislostí, rozbité odkazy a build, a pošle ti jeden mail se semaforem: zelená = nic nedělej, oranžová = tohle si přečti.

Můžu to připravit ve stejném stylu jako ty stávající health-check maily, aby to zapadlo mezi ně. Řekni si a nachystám to.

---

## Souhrn — co potřebuju k realizaci

| Bod | Můžu udělat sám | Potřebuju od tebe |
|---|---|---|
| 3 — ceník | celou stránku i rozmístění cen po webu | **čísla** (spodní hranice a rozpětí u služeb) |
| 6 — sjednocení | rozšíření šablony na podřazené huby, AI blok do služeb | odsouhlasit hlavní větu příběhu |
| 9 — měření | serverové počítání poptávek + týdenní mail | kam ukládat historii (log / VPS / KV) |
| 10 — údržba | měsíční automatický report mailem | jen odsouhlasit rozsah |
