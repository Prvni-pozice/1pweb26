# web-1P — fáze 1 integrita obsahu

P0 | /zasady-ochrany-udaju/ | Chybné DIČ „CZ29136342" (všude jinde CZ29136334) | opravit | zasady-ochrany-udaju/index.astro:16
P0 | všechny | GA4 G-5XDVHLWRP4 bez souhlasu, žádná cookie lišta; zásady tvrdí „oprávněný zájem" — analytické cookies vyžadují opt-in | consent lišta + Consent Mode v2, nebo cookieless + úprava zásad | Base.astro:83-104
P1 | patička | Chybí sídlo + sp. zn. + soud (§ 435 NOZ) — jen ©+IČO+DIČ | doplnit „Na Úlehli 1256/9, Praha 4 · sp. zn. C 203684, Městský soud v Praze" PO OVĚŘENÍ | Footer.astro:46
P1 | patička | Žádný odkaz na /zasady-ochrany-udaju/ | přidat | Footer.astro:21-28
P1 | zasady | Sídlo a sp. zn. nepodložené v repu | OTÁZKA klientovi (výpis z OR) | zasady…/index.astro:15-17
P1 | JSON-LD | ProfessionalService bez address | doplnit PostalAddress | Base.astro:40-51
P1 | dup. titly | NEJSOU duplicitní obsah (hub vs článek) — canonical/301 by byl ŠPATNĚ | rozlišit title přidáním rodiče | [...path].astro:36-39
P1 | 4× akce-a-prednasky | mrtvé obrázky /UserFiles/Image/prednasky… 404 | odstranit v cleanMigratedContent nebo dostáhnout | site.json
P1 | /, /o-nas/ | „15+ let"/„už 15 let" — IČO odpovídá ~2011/2012 (=14 let) | OTÁZKA: rok založení; bezpečnější „od roku 20XX" | index.astro:23, o-nas:5,21,43
P1 | / | „3× rychlejší prototyp" nepodložené | OTÁZKA; jinak „prototyp za dny, ne měsíce" | index.astro:22
P1 | / | Trust bar Diton/TLC/Ciret/Ostendorf/Synpro — nemají referenci na webu | OTÁZKA: potvrzení klientství + užití loga | index.astro:63-74
P2 | /ai-agenti/:28 | H1 tyká (jediné na webu) | „Nechte agenta napsat první verzi." | ai-agenti/index.astro:28
P2 | /kontakt/ | no-JS submit → ?odeslano=1 bez zpracování | hláška při parametru | api/contact.js:156 + kontakt/index.astro
P2 | /o-nas/ | „už 15 let" vs „15+ let" | sjednotit po vyřešení roku | o-nas:5,21

KNOWN-ISSUES ZASTARALÉ: PROGRESS.md ř. 77-81 neplatí — migrace hotová (347 stran, nic do 404), form backend = api/contact.js s Resend (honeypot+rate-limit, env mimo git), footer video = záměrný CSS fallback. Aktualizovat PROGRESS.md.
POZOR: F2 hlásí formulář 404 — to je artefakt lokálního preview (astro preview neobsluhuje API routes); na Vercelu ověřit!

Čisté: kontakty konzistentní (kromě P0 DIČ), tel:=text, © dynamický, žádné zbytky, migrace bez entit/starých cen, značka jednotná.


> **Upřesnění (4. 8. 2026):** § 435 NOZ vyžaduje na webu jméno a sídlo podnikatele. Údaj o zápisu v rejstříku včetně oddílu a vložky (spisová značka) zákon váže na **obchodní listiny** — faktury, smlouvy, objednávky — nikoli výslovně na web. Doporučení „doplnit spisovou značku do patičky" bylo v původním znění reportu přeceněné; do patičky patří jméno, sídlo a IČO.
