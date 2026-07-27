# Redakční standard — web První pozice (prvni-pozice.com)

Cílovka: **majitelé a manažeři malých a středních firem (SMB)**. Zajímá je: poptávky, tržby, ušetřený čas, srozumitelnost. Nezajímá je: technický žargon bez kontextu, marketingová vata.

Referenční hlas (z homepage): „Držíme vás na první pozici. Teď i s AI." — sebevědomý, věcný, lidský, krátké věty, benefity, konkrétnost.

## Pravidla (závazná)

1. **Oslovování**: vždy malé „vy / vás / vaše / vám" (nikdy „Vy / Vaši / Vám" s velkým V). Sjednotit v celém textu.
2. **Vata pryč**: „V dnešní době", „v dnešním rychlém světě", „je třeba zmínit", „jak jistě víte"… smazat nebo nahradit věcným sdělením. Dlouhá souvětí rozdělit.
3. **Interpunkce a překlepy**: „.." → „." (nebo „…" jen kde má výpustka smysl), dvojité mezery pryč, opravit čárky a překlepy. České uvozovky „" a pomlčka — zachovat/zavést.
4. **CTA**: aktivní a konkrétní — „Domluvit konzultaci", „Ozvěte se", „Chci podobný web". Ne „Kontaktujte naši zákaznickou podporu". CTA odkazy vést na /kontakt/.
5. **Benefit místo feature**: přeformulovat na to, co z toho firma má (víc poptávek, vyšší tržby, méně ruční práce). Ale věcně — žádné prázdné superlativy.
6. **Reference** (typ `reference`): držet strukturu „co klient potřeboval → co jsme dodali → co to přineslo". Zachovat všechna fakta. **Nikdy nevymýšlet čísla, výsledky ani služby, které v textu nejsou.**
7. **Články** (typ `article`): lehčí ruka. Oprav chyby, moderní oslovování, zkrať vatové úvody, vylepši nadpisy, ať slibují užitek. Odbornou substanci a strukturu zachovej — nepřepisuj celé články, needituj citace a přeložené texty třetích stran (např. citace Googlu) jinak než opravou překlepů.
8. **HTML zachovat**: tagy, odkazy (href), obrázky (src, alt), kotvy (`<a id="cl_..." class="clanek-anchor">`), class atributy, `<p class="archive">` bloky. Měníš jen textový obsah. Entity (`&nbsp;` apod.) můžeš normalizovat, ale nesmíš rozbít validitu HTML.
9. **Nic faktického nemazat** — mazat jen čistou vatu. Nepřidávat vymyšlené údaje, ceny, jména, sliby.
10. **`intro` napsat nově**: plain text (bez HTML), max 150 znaků, funguje jako meta description i perex karty — benefit + co na stránce najdu. Nesmí končit useknutým slovem.
11. **Neměnit**: `label`, `slug`, `path`, `children`, `thumb`, `ext`, `type` — jen `content` a `intro`.
12. Interní odkazy v textu zachovat (mají SEO hodnotu), jen kolem nich vylepšit formulace.

## Poznámka

Podle tohoto standardu byly 2026-07-27 zredigovány všechny podstrany webu (commit 3b63104). Nové texty ať ho drží, aby web zůstal jednotný.
