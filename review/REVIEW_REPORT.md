# Předávací kontrola — web-1P (nový hlavní web První pozice)

Datum: 3. 8. 2026 · Rozsah: 347 stránek (ruční stránky + 340 migrovaných z prvni-pozice.com) · Kontrolováno na produkčním buildu, web zatím není nasazený.

## Co se kontrolovalo

- **Fáze 0 — automatické tvrdé kontroly.** Všech 347 stránek: odkazy interní i externí, chyby v konzoli, chybějící soubory, titulky a popisky, strukturovaná data, chování v šířkách 375 / 768 / 860 / 1280 / 1920 px, přístupnost (axe-core).
- **Fáze 1 — integrita obsahu.** Křížová kontrola kontaktních a fakturačních údajů, právní náležitosti, hledání zbytků a nedodělků, kontrola migrovaného obsahu.
- **Fáze 2 — pohled zákazníka.** Šest scénářů očima majitele menší výrobní firmy z Vysočiny na mobilu, včetně odeslání testovací poptávky.
- **Fáze 3 — UX audit a copywriting** (dva samostatné průchody).
- **Fáze 4 — srovnání s oborem:** Webforte, Apertia.ai, eVisions.

## Výsledek v číslech

Automatická kontrola našla před opravami **187 tvrdých nálezů** na 347 stránkách.
Po opravách a opakovaném proměření zbyly **tři** — a všechny tři jsou plané poplachy:
odkazy na weby klientů alfa-top.cz, maturaknaklic.cz a parkdesetileti.cz, které
při ověření z prohlížeče fungují a jen blokují automatické dotazy.

Personální fáze 1–3 doplnily zhruba dalších 65 nálezů, z nichž je opraveno 30;
zbytek čeká na podklady od vás (viz níže).

## Co se našlo a opravilo

**Analytika běžela bez souhlasu (blokující).** Google Analytics se načítal každému návštěvníkovi a web neměl žádnou lištu souhlasu. U analytických cookies to zákon o elektronických komunikacích (§ 89 odst. 3) nedovoluje — vyžaduje předchozí souhlas. Zásady ochrany údajů navíc uváděly jako právní titul „oprávněný zájem", což pro tento účel neobstojí. Nasadil jsem Consent Mode v2 s výchozím stavem „zamítnuto" a lištu souhlasu; skript Googlu se nyní vůbec nestáhne, dokud návštěvník nesouhlasí. Text zásad je opravený na souhlas.

**Chybné DIČ (blokující).** Stránka zásad uváděla DIČ CZ29136342, zatímco patička, kontakt i strukturovaná data správně CZ29136334.

**Chyběla chybová stránka.** Web neměl vlastní stránku 404 — návštěvník na neexistující adrese viděl výchozí obrazovku hostingu. Vytvořena, s vyloučením z indexace.

**Vložená videa přetékala mobil.** Pět stránek s videem z migrace se na displeji 375 px roztahovalo o 217 px do stran (rámy mají pevnou šířku 560 px z původního webu). Opraveno plošně pro všechny migrované stránky, včetně tabulek a bloků kódu.

**Navigace byla nekonzistentní.** Na desktopu chyběly obě AI služby (dostupné jen z patičky a z karet na úvodní stránce), zatímco vysouvací menu na mobilu mělo úplně jiný seznam v jiném pořadí. Sjednoceno. Jedna sekce se navíc jmenovala čtyřmi způsoby — „Marketing", „GEO a marketing", „SEO a marketing", „Online marketing"; nyní všude „Online marketing".

**Mrtvé odkazy na weby klientů.** V referencích i migrovaných článcích vedlo dvanáct odkazů na servery, které neodpovídaly. Každý jsem ověřil zvlášť z prohlížeče — tři z nich (alfa-top.cz, maturaknaklic.cz, parkdesetileti.cz) jsou ve skutečnosti živé a jen blokují automatické dotazy, ty zůstávají. Zbylých devět je opravdu mrtvých a odlinkoval jsem je; text zůstal, zmizel jen odkaz.

**Duplicitní titulky.** Tři dvojice stránek měly shodný titulek. Nešlo ale o duplicitní obsah — vždy jde o rozcestník a článek stejného jména, takže kanonizace nebo přesměrování by bylo chybné. Titulek nyní při shodě rozlišuje nadřazená sekce („SEO (Pojmy v SEO)").

**Popisky pro vyhledávače.** Zhruba 150 referencí mělo popisek pod doporučených 120 znaků a generátor je navíc ořezával uprostřed slova. Nový vzorec doplňuje sekční dovětek a ořezává na hranici slova; kontrolní vzorek vychází na 133–140 znaků. Ručně přepsané popisky dostaly i stránky Kontakt, AI školení a AI a agenti.

**Mrtvý formulář.** Článek o proběhlém školení obsahoval vložený Google formulář k akci z minulosti, který házel chyby do konzole. Nahrazen odkazem na kontakt.

**Drobnosti.** Odkaz na zásady ochrany údajů do patičky (dosud se na ně dalo dostat jen přes zaškrtávátko ve formuláři), nadpis na stránce AI agentů tykal proti zbytku webu, „jde vidět" → „je vidět", „načtení během milisekund" → „do sekundy" (původní tvrzení bylo technicky nereálné), „Na úlehli" → „Na Úlehli".

## Co potřebuje vaše potvrzení

Nic z následujícího jsem nedoplňoval, protože bych si to musel vymyslet:

- **Sídlo a spisová značka do patičky.** Zákon (§ 435 občanského zákoníku) vyžaduje na webu podnikatele obchodní firmu, sídlo, IČO a údaj o zápisu v rejstříku. IČO i DIČ na webu jsou, sídlo a spisová značka chybí. Na stránce zásad je uvedeno „Na Úlehli 1256/9, sp. zn. C 203684, Městský soud v Praze" — ale tento údaj nemá v projektu žádný zdroj, potřebuji ho ověřit proti výpisu z rejstříku.
- **Rok založení.** Web tvrdí „15+ let na trhu" a „už 15 let", ale IČO 29136334 odpovídá zápisu kolem roku 2011–2012, tedy 14 let. Buď to sjednotit, nebo raději psát „od roku 20XX".
- **Údaj „3× rychlejší prototyp"** na úvodní stránce — čím je podložený?
- **Pás „Důvěřují nám"** uvádí Diton, TLC, Ciret, Ostendorf-Osma a Synpro. Žádná z těchto firem nemá na webu referenci. Potvrdit, že jde o klienty a že smíme použít jejich logo.
- **Ceny a průběh zakázky.** Na celém webu není ani orientační cena, ani popis, jak spolupráce probíhá. V testovacím průchodu to byl nejsilnější důvod, proč by zákazník odešel. Doporučuji sekci „Jak spolupráce probíhá" ve čtyřech krocích a alespoň rámcové rozpětí.
- **Formulář na produkci.** V lokálním náhledu odeslání skončilo chybou 404, ale to je nejspíš artefakt — `astro preview` neobsluhuje serverové funkce. Kód formuláře existuje a používá Resend. Před spuštěním je potřeba odeslat skutečnou testovací poptávku na Vercelu a ověřit, že dorazí.
- **PROGRESS.md je zastaralý.** Sekce „Zbývá" mluví o nemigrovaných stránkách a placeholderu formuláře — obojí je hotové.

## Verdikt srovnání s oborem

Proti Webforte, Apertia.ai a eVisions jsme měřitelně první v rychlosti (úvodní stránka 56 kB proti 181–332 kB konkurence), v počtu jmenovaných referencí a v tom, že AI není jedna služba z mnoha, ale pozice celé firmy — včetně kategorie „rapidní vývoj s agenty", kterou nenabízí nikdo z nich.

Kde nás předbíhají: čísla. Webforte má 47 projektů, ale na úvodní stránce říká „+561 % návštěvnosti" a „94 % klientů se vrací". My máme přes 80 referencí a u žádné není jediný výsledek.

**Jedna změna s největším dopadem: dvě až tři případové studie s čísly** — výsledek, doba dodání, co agent reálně ušetřil. Jedna případovka typu „AI prototyp za pět dní místo tří měsíců" by zhmotnila celé naše pozicování lépe než dalších sto referencí.


> **Upřesnění (4. 8. 2026):** § 435 NOZ vyžaduje na webu jméno a sídlo podnikatele. Údaj o zápisu v rejstříku včetně oddílu a vložky (spisová značka) zákon váže na **obchodní listiny** — faktury, smlouvy, objednávky — nikoli výslovně na web. Doporučení „doplnit spisovou značku do patičky" bylo v původním znění reportu přeceněné; do patičky patří jméno, sídlo a IČO.
