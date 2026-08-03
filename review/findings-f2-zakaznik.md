# web-1P — fáze 2 pohled zákazníka (majitel výrobní firmy, mobil)

P0 | /kontakt/ | Formulář POST /api/contact → 404, „Něco se pokazilo" — poptávka nedoručitelná (known issue backend placeholder) | nasadit + otestovat backend; do té doby mailto fallback
P0 | celý web | Nikde cena/orientace ani průběh zakázky — scénář „kolik a jak" končí slepě | sekce „Jak spolupráce probíhá" (4 kroky) + cenová orientace
P1 | /weby/ | 68 karet v 1 sloupci ~20 500 px na mobilu, bez filtru | filtr/štítky dle oboru + „načíst další"
P1 | /weby/ /eshopy/ | náhledy skoro černé (overlay) — klik naslepo | zesvětlit overlay, jen za textem
P1 | navigace | „Marketing"/„GEO a marketing"/„SEO a marketing"/„Online marketing" = 4 názvy | sjednotit
P1 | mobilní menu | AI školení první, Kontakt uprostřed | řadit: Weby, E-shopy, Marketing, AI & agenti, AI školení, O nás, Blog, Kontakt
P1 | /marketing/ | „Zobrazit referenci →" na kartách služeb; služby smíchané s archivem (Akce, VIDEO, TISK) | „Více o službě →"; oddělit
P1 | footer | „Reference" → jen /weby/ | přejmenovat nebo hub /reference/
P1 | detaily referencí | bez čísel/výsledků | top 5–10 s metrikami
P1 | /ai-agenti/ | blog upoutávky v dev žargonu na podnikatelské stránce | kurátorovat byznysové články
P1 | /skoleni/ | chybí formát/délka/cena | doplnit
P2 | header | telefon až přes burger+scroll (10–15 s) | tel: ikona v hlavičce
P2 | /ai-agenti/ | prázdná bílá plocha (lazy-load bez placeholderu) | aspect-ratio + placeholder
P2 | / | AI messaging přebíjí základní nabídku | vyvážit
P2 | /marketing/seo/ | archiv referencí působí staře | označit roky, upozadit

Verdikt: profesionální, do 30 s jasné; ale bez cen/procesu volám naslepo a formulář 2× spadl — bez doporučení bych odešel. /kontakt/ stránka nejlepší část webu.
