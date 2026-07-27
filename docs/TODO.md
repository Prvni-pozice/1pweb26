# ToDo — web První pozice

Seznam otevřených úkolů. Založeno 2026-07-27 z CEO auditu, průběžně aktualizovat.
Odškrtnuté položky nechávat s datem, ať je vidět historie.

## Byznys — konverze poptávek

- [ ] **Case studies s čísly.** 121 referenčních stránek popisuje, co jsme udělali, ale ne co to klientovi přineslo. Vybrat 3–5 vlajkových a přepracovat na strukturu zadání → řešení → výsledek v číslech (návštěvnost, poptávky, tržby). Pro majitele SMB nejsilnější prodejní argument. *Blokuje: potřebujeme od klientů reálná čísla a souhlas je zveřejnit.*
- [ ] **Testimonialy.** Web nemá jediný citát klienta. Obvolat 5 spokojených klientů, získat krátké citace (ideálně se jménem a firmou) → homepage + servisní stránky.
- [ ] **Cenová kotva.** SMB se ptá „kolik to stojí" a bez odpovědi odchází ke konkurenci, která rozpětí uvádí. Doplnit aspoň orientační „weby od X Kč" u služeb. *Blokuje: rozhodnutí, jaká čísla uvádět.*
- [ ] **Lead magnet pro AI školení.** Mini-audit „kde vám AI ušetří peníze" nebo PDF checklist výměnou za e-mail + navazující sekvence. Dnes web sbírá jen tvrdé poptávky.
- [ ] **Stránka „Služby a ceny" na jednom místě.** Služby jsou roztroušené mezi /weby/, /eshopy/, /marketing/, /skoleni/, /ai-agenti/. Majitel firmy chce jeden přehled: co, pro koho, přibližně za kolik.

## Positioning

- [ ] **Fotky a medailonky týmu v „O nás".** Kontakty jmenují 5 lidí bez fotek. SMB kupuje od lidí — nejlevnější zvýšení důvěryhodnosti, jaké web má k dispozici.
- [ ] **Galerie snímků u referencí e-shopů.** Zatím mají jen prezentační weby. (Starší TODO, stále otevřené.)
- [ ] **28 referencí bez náhledového obrázku a 30 bez odkazu na web klienta** — v přehledech vypadají prázdné. Doplnit screenshoty.

## Obsah a struktura

- [ ] **Blog: přesměrovat energii ze starého SEO obsahu na AI témata.** Ze 183 článků je velká část „pojmy v SEO" a přepisy Google Office Hours z let 2021–2023 — cílovku nezajímají a netáhnou AI positioning. Návrh: ~20 nejsilnějších aktualizovat, zbytek sloučit do několika velkých průvodců, zbytek noindex.
- [ ] **Archivní sekce (32 stránek).** /weby/archiv/, /eshopy/archiv/, /marketing/seo/archiv/ drží staré reference na zastaralých technologiích. Rozhodnout, co nechat indexovatelné a co dát noindex.
- [ ] **Příliš hluboká URL struktura.** 105 stránek je 5–6 úrovní hluboko. Zvážit zploštění blogu na /blog/<slug>/ s tagy (s 301 redirecty — infrastruktura na to je). *Větší zásah, naplánovat zvlášť.*
- [ ] **H1 u referencí je jen název klienta.** Lepší „Nový web pro Technocon — výroba a servis technologií". Chce projít ručně.
- [ ] **Staré přednášky 2016–2017** (/marketing/prednasky/*) — 3 stránky zůstávají pahýly: mají jen datum, místo a plakát, chybí program a řečník. Doplnit podklady, nebo sloučit do jedné stránky, nebo zrušit s redirectem. *Blokuje: chybí podklady, co na přednáškách bylo.*
- [ ] **`/marketing/tisk/`** — pahýl. Cokoli navíc by znamenalo vymyslet nabídku tiskových služeb. *Blokuje: co vlastně v tisku nabízíte.*
- [ ] **Text `/marketing/` se nezobrazuje.** Sekce se renderuje komponentou `SectionRoot` z `categories.json`, `content` ze site.json ignoruje. Napsaný text zatím slouží jen jako meta description. Sjednotit při rozšíření kategorijní šablony (viz bod „Sjednotit příběh" níže).

## Měření a provoz

- [ ] **GA4 běží bez souhlasu návštěvníka** — bez cookie lišty i bez Consent Mode v2. Pro ČR právně rizikové. Varianty: consent lišta, nebo přechod na cookieless analytiku (Plausible/Umami/Vercel Analytics) a lišta odpadá. *Vědomě odloženo 2026-07-27.*
- [ ] **Měřit konverze formuláře** — odeslání poptávky jako GA4 event nebo aspoň týdenní počet poptávek. Dnes není vidět, co web reálně nosí.
- [ ] **Pravidelná údržba** — měsíčně `npm audit` + aktualizace závislostí, kontrola 404 a redirectů v Search Console. Dá se zautomatizovat jako report.

## Návrhy připravené k realizaci

Podrobné rozpracování je v `NAVRHY-cenik-positioning-mereni-udrzba.md`.

- [ ] **Ceník + cenová kotva napříč webem** — návrh hotový (kde zobrazit „od X Kč", struktura podstrany `/cenik/`). *Blokuje: čísla od tebe.*
- [ ] **Sjednocení příběhu „lokální agentura + AI"** — rozšířit kategorijní šablonu z `categories.json` na podřazené huby (/marketing/seo/, /marketing/geo/, /grafika/ …), přidat „AI nit" do každé služby.
- [ ] **Serverové měření poptávek** — počítat konverze v `/api/contact` bez osobních údajů (nepotřebuje souhlas, měří 100 %) + týdenní e-mail.
- [ ] **Měsíční automatický údržbový report** — audit závislostí, rozbité odkazy, build; mailem ve stylu stávajících health-check zpráv z `vps-setup`.

## Hotovo

- [x] 2026-07-27 — Copy-edit všech 334 podstran pro cílovku SMB (viz `REDAKCNI-STANDARD.md`)
- [x] 2026-07-27 — Doplněn obsah 20 prázdných a pahýlových stránek; úklid archivních přehledů
- [x] 2026-07-27 — Responzivní obrázky v obsahu (pevné rozměry ze stylu do atributů)
- [x] 2026-07-27 — Bezpečnostní hlavičky, rate limit kontaktního formuláře, 5 high zranitelností → 0
- [x] 2026-07-27 — Strukturovaná data: BreadcrumbList + Article/BlogPosting
- [x] 2026-07-27 — Mrtvý formulář na „SEO analýza zdarma" nahrazen funkčním CTA
