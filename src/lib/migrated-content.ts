/**
 * Úklid HTML převzatého ze starého webu.
 *
 * Obsah v `site.json` je scrapnutý ze starého CMS tak, jak byl. Většina je
 * v pořádku, ale některé kusy odkazují na soubory, které se při migraci
 * nestáhly a na starém webu už neexistují.
 */

/**
 * Odstraní dlaždice fotogalerie ze starého CMS.
 *
 * Vypadají takhle a bývají na konci obsahu:
 *   <a rel="lightbox[2300]" class="lightbox thumb"
 *      href="./fotogalerie/big/71.jpg"
 *      style="background-image: url(./fotogalerie/big/71.jpg);" title=""></a>
 *
 * Proč pryč: soubory `fotogalerie/big/*.jpg` se při migraci nestáhly a starý
 * web je už neservíruje (přesměruje na úvod); nejsou ani ve Wayback Machine.
 * Na 98 stránkách to znamenalo 168 požadavků končících 404 a prázdné odkazy
 * bez popisku, které axe hlásí jako chybu přístupnosti (`link-name`).
 *
 * Data v `site.json` se schválně nemění — kdyby se fotky někde našly, stačí
 * je doplnit do `public/` a tuhle funkci vypnout.
 */
export function stripDeadGalleries(html: string): string {
  return html
    .replace(/<a[^>]*class="lightbox thumb"[^>]*>\s*<\/a>/g, '')
    // po odstranění dlaždic zbývá prázdný obal, pokud v něm nic jiného nebylo
    .replace(/<div[^>]*class="[^"]*gallery[^"]*"[^>]*>\s*<\/div>/g, '')
    .trimEnd();
}

/**
 * Obrázek, jehož `src` není cesta ani URL. Export ze starého CMS občas do `src`
 * propsal popisek („kruhový graf“) — prohlížeč to vezme jako relativní cestu,
 * skončí to 404 a na stránce zůstane ikona rozbitého obrázku.
 */
function stripBrokenImages(html: string): string {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = tag.match(/\ssrc="([^"]*)"/)?.[1] ?? '';
    const looksLikePath = /^(https?:|\/|\.{1,2}\/)/.test(src) || /\.[a-z0-9]{2,5}($|\?)/i.test(src);
    return looksLikePath ? tag : '';
  });
}

/**
 * Popisky pod obrázky mají ze starého CMS natvrdo `color:#888` — na bílé je to
 * 3,54:1, tedy pod AA. Barva se přepisuje na roli z design systému, aby se
 * měnila na jednom místě a prošla kontrastem.
 */
function fixHardcodedCaptionColor(html: string): string {
  return html.replace(/color\s*:\s*#888(888)?\b/gi, 'color:var(--text-muted)');
}

/**
 * Srovná úrovně nadpisů v převzatém obsahu.
 *
 * Starý CMS sázel uvnitř článku, co se zrovna hodilo — na referencích bývá první
 * nadpis rovnou `<h3>` (pod `<h1>` stránky je to přeskočená úroveň, 142 stránek),
 * jinde je v obsahu vlastní `<h1>`, takže má stránka dvě.
 *
 * Nejmenší použitá úroveň se posune na `h2` a zbytek se posune se stejným
 * rozdílem — vzájemná struktura zůstane, jen sedne pod nadpis stránky.
 */
function normalizeHeadings(html: string): string {
  const used = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  if (!used.length) return html;

  // 1) posun celého bloku tak, aby nejmenší použitá úroveň byla h2
  const shift = 2 - Math.min(...used);

  // 2) srovnání posloupnosti: úroveň nesmí přeskočit o víc než jeden stupeň
  //    (starý CMS má na některých stránkách h3 dřív než první h2).
  let prev = 1;
  const mapped: number[] = [];
  for (const lvl of used) {
    const shifted = Math.min(6, Math.max(2, lvl + shift));
    const next = Math.min(shifted, prev + 1);
    mapped.push(next);
    prev = next;
  }

  let i = 0;
  const open = new Map<number, number>(); // původní úroveň → nová, kvůli </hN>
  return html.replace(/<(\/?)h([1-6])\b/gi, (_m, slash: string, lvl: string) => {
    const orig = Number(lvl);
    if (slash) {
      const to = open.get(orig) ?? orig;
      open.delete(orig);
      return `</h${to}`;
    }
    const to = mapped[i++] ?? orig;
    open.set(orig, to);
    return `<h${to}`;
  });
}

/** Celý úklid pohromadě — tohle volají šablony. */
export function cleanMigratedContent(html: string): string {
  return normalizeHeadings(
    fixHardcodedCaptionColor(stripBrokenImages(stripDeadGalleries(html))),
  );
}
