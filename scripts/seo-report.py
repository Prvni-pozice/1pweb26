#!/usr/bin/env python3
"""Denní sběr SEO dat z Google Search Console pro dashboard /api/statistiky.

Stáhne výkonová data doménové property (kliky, imprese, CTR, pozice),
spočítá odvozené pohledy (měsíční vývoj, příležitosti s nízkým CTR, nové
a ztracené dotazy, dotazy na dohled první trojky) a snapshot pošle na
https://www.prvni-pozice.com/api/seo-data, odkud ho čte dashboard i týdenní mail.

V pondělí (nebo s --indexace) navíc projde všechny URL ze sitemap přes
URL Inspection API a přidá stav indexace.

Platform properties zatím API neumí — pokud existují CSV exporty
v data/gsc-platformy/<platforma>/, přibalí je jako sekci "platformy".

Tajemství: env REPORT_SECRET, nebo /etc/web-1p-report.env (stejné jako týdenní report).
Klíč ke GSC: env GSC_KEY, jinak /home/admin/.config/gsc/key.json.

Použití:
  python3 scripts/seo-report.py                  # sběr + POST na web
  python3 scripts/seo-report.py --soubor out.json  # jen zapsat JSON (bez POSTu)
  python3 scripts/seo-report.py --indexace       # vynutit i kontrolu indexace

Cron (denně 6:50, jako root — kvůli čtení /etc/web-1p-report.env):
  50 6 * * * /usr/bin/python3 /data/bot/web-1P/scripts/seo-report.py >> /var/log/web-1p-seo.log 2>&1
"""
import csv
import datetime as dt
import json
import os
import re
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gsc

gsc.KEY_PATH = os.environ.get("GSC_KEY", "/home/admin/.config/gsc/key.json")

SEO_URL = os.environ.get("SEO_URL", "https://www.prvni-pozice.com/api/seo-data")
ENV_SOUBOR = "/etc/web-1p-report.env"
PLATFORMY_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                             "data", "gsc-platformy")
API_BASE = ("https://www.googleapis.com/webmasters/v3/sites/"
            + urllib.parse.quote(gsc.SITE_URL, safe=""))

# Orientační CTR podle pozice — pro odhad, kolik kliků leží na stole.
OCEKAVANE_CTR = {1: .28, 2: .15, 3: .10, 4: .07, 5: .05, 6: .04, 7: .03, 8: .025, 9: .02, 10: .018}


def ocekavane_ctr(pozice):
    return OCEKAVANE_CTR.get(max(1, round(pozice)), .01)


def query(token, telo):
    out = gsc.api("POST", f"{API_BASE}/searchAnalytics/query", token, telo)
    return out.get("rows", [])


def radek(r):
    return {"kliky": r["clicks"], "imprese": r["impressions"],
            "ctr": round(r["ctr"], 4), "pozice": round(r["position"], 1)}


def soucet(rows):
    kliky = sum(r["clicks"] for r in rows)
    imprese = sum(r["impressions"] for r in rows)
    # průměrná pozice vážená impresemi (stejně jako GSC v souhrnu)
    pozice = (sum(r["position"] * r["impressions"] for r in rows) / imprese) if imprese else 0
    return {"kliky": kliky, "imprese": imprese,
            "ctr": round(kliky / imprese, 4) if imprese else 0,
            "pozice": round(pozice, 1)}


def nacti_tajemstvi():
    if os.environ.get("REPORT_SECRET"):
        return os.environ["REPORT_SECRET"]
    try:
        for line in open(ENV_SOUBOR):
            m = re.match(r"\s*REPORT_SECRET\s*=\s*(.+?)\s*$", line)
            if m:
                return m.group(1).strip("'\"")
    except OSError:
        pass
    return None


def indexace(token):
    """Stav indexace všech URL ze sitemap (URL Inspection, pár minut)."""
    from collections import Counter
    from concurrent.futures import ThreadPoolExecutor
    xml = urllib.request.urlopen(gsc.SITEMAP_URL).read().decode()
    urls = re.findall(r"<loc>(.*?)</loc>", xml)

    def inspect(url):
        try:
            out = gsc.api("POST",
                          "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                          token, {"inspectionUrl": url, "siteUrl": gsc.SITE_URL})
            return out["inspectionResult"]["indexStatusResult"].get("coverageState", "?")
        except Exception:
            return "ERROR"

    with ThreadPoolExecutor(max_workers=6) as ex:
        stavy = list(ex.map(inspect, urls))
    pocty = Counter(stavy)
    indexovano = sum(n for s, n in pocty.items() if "indexed" in s.lower() and "not" not in s.lower())
    return {"datum": dt.date.today().isoformat(), "celkem": len(urls),
            "indexovano": indexovano, "stavy": dict(pocty.most_common())}


def platformy():
    """CSV exporty z GSC platform properties: data/gsc-platformy/<platforma>/*.csv.
    Hledá se soubor s denní řadou (sloupec s datem YYYY-MM-DD)."""
    vysledek = []
    if not os.path.isdir(PLATFORMY_DIR):
        return vysledek
    for nazev in sorted(os.listdir(PLATFORMY_DIR)):
        slozka = os.path.join(PLATFORMY_DIR, nazev)
        if not os.path.isdir(slozka):
            continue
        denni = {}
        for soubor in sorted(os.listdir(slozka)):
            if not soubor.lower().endswith(".csv"):
                continue
            try:
                with open(os.path.join(slozka, soubor), newline="", encoding="utf-8-sig") as f:
                    for row in csv.reader(f):
                        if len(row) < 3 or not re.match(r"^\d{4}-\d{2}-\d{2}$", row[0]):
                            continue
                        cislo = lambda s: int(float(str(s).replace(",", ".").replace(" ", "").replace(" ", "") or 0))
                        denni[row[0]] = [cislo(row[1]), cislo(row[2])]
            except Exception as e:
                print(f"platformy: {nazev}/{soubor} přeskočeno ({e})", file=sys.stderr)
        if not denni:
            continue
        dny = sorted(denni)[-56:]
        p28 = dny[-28:]
        vysledek.append({
            "nazev": nazev,
            "kliky28": sum(denni[d][0] for d in p28),
            "imprese28": sum(denni[d][1] for d in p28),
            "denni": [[d, *denni[d]] for d in dny],
        })
    return vysledek


def main():
    args = sys.argv[1:]
    vystup = None
    if "--soubor" in args:
        vystup = args[args.index("--soubor") + 1]
    s_indexaci = "--indexace" in args or dt.date.today().weekday() == 0

    token = gsc.get_token()
    konec = dt.date.today() - dt.timedelta(days=2)   # GSC data mají ~2denní zpoždění

    def d(pred_dny):
        return (konec - dt.timedelta(days=pred_dny)).isoformat()

    # denní řada 56 dní (hero karty + sparkliny + týdenní mail)
    denni_rows = query(token, {"startDate": d(55), "endDate": d(0),
                               "dimensions": ["date"], "rowLimit": 100})
    denni_mapa = {r["keys"][0]: r for r in denni_rows}
    denni = []
    for i in range(55, -1, -1):
        den = d(i)
        r = denni_mapa.get(den)
        denni.append([den, r["clicks"] if r else 0, r["impressions"] if r else 0])
    aktualni28 = soucet([r for r in denni_rows if r["keys"][0] >= d(27)])
    predchozi28 = soucet([r for r in denni_rows if r["keys"][0] < d(27)])

    # měsíční vývoj — od prvního dne měsíce před 12 měsíci
    prvni_mesic = (konec.replace(day=1) - dt.timedelta(days=365)).replace(day=1)
    mesicni_rows = query(token, {"startDate": prvni_mesic.isoformat(), "endDate": d(0),
                                 "dimensions": ["date"], "rowLimit": 500})
    po_mesicich = {}
    for r in mesicni_rows:
        po_mesicich.setdefault(r["keys"][0][:7], []).append(r)
    mesicni = [[m, *soucet(rows).values()] for m, rows in sorted(po_mesicich.items())]

    # stránky za 28 dní → příležitosti s nízkým CTR
    stranky = query(token, {"startDate": d(27), "endDate": d(0),
                            "dimensions": ["page"], "rowLimit": 250})
    prilezitosti = []
    for r in stranky:
        if r["impressions"] < 50:
            continue
        potencial = round(r["impressions"] * ocekavane_ctr(r["position"]) - r["clicks"])
        if potencial < 5:
            continue
        prilezitosti.append({"stranka": re.sub(r"^https?://(www\.)?prvni-pozice\.com", "", r["keys"][0]) or "/",
                             **radek(r), "potencial": potencial})
    prilezitosti.sort(key=lambda x: -x["potencial"])

    # dotazy: aktuálních 28 dní vs. předchozích 28
    dotazy_ted = {r["keys"][0]: r for r in query(token, {
        "startDate": d(27), "endDate": d(0), "dimensions": ["query"], "rowLimit": 1000})}
    dotazy_pred = {r["keys"][0]: r for r in query(token, {
        "startDate": d(55), "endDate": d(28), "dimensions": ["query"], "rowLimit": 1000})}

    def seznam(rows):
        return [{"dotaz": r["keys"][0], **radek(r)} for r in rows]

    nove = seznam(sorted((r for q, r in dotazy_ted.items()
                          if q not in dotazy_pred and r["impressions"] >= 3),
                         key=lambda r: -r["impressions"]))[:15]
    ztracene = seznam(sorted((r for q, r in dotazy_pred.items()
                              if q not in dotazy_ted and r["impressions"] >= 3),
                             key=lambda r: -r["impressions"]))[:15]
    nadohled = seznam(sorted((r for r in dotazy_ted.values()
                              if 3.5 <= r["position"] <= 10 and r["impressions"] >= 10),
                             key=lambda r: -r["impressions"]))[:15]
    top_dotazy = seznam(sorted(dotazy_ted.values(), key=lambda r: (-r["clicks"], -r["impressions"])))[:10]
    top_stranky = [{"stranka": re.sub(r"^https?://(www\.)?prvni-pozice\.com", "", r["keys"][0]) or "/", **radek(r)}
                   for r in sorted(stranky, key=lambda r: (-r["clicks"], -r["impressions"]))[:10]]

    snapshot = {
        "verze": 1,
        "vytvoreno": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "obdobi": {"od": d(27), "do": d(0)},
        "souhrn28": aktualni28,
        "predchozi28": predchozi28,
        "denni": denni,
        "mesicni": mesicni,
        "prilezitosti": prilezitosti[:12],
        "dotazy": {"nove": nove, "ztracene": ztracene, "nadohled": nadohled, "top": top_dotazy},
        "top_stranky": top_stranky,
        "indexace": indexace(token) if s_indexaci else None,
        "platformy": platformy(),
    }

    if vystup:
        with open(vystup, "w") as f:
            json.dump(snapshot, f, ensure_ascii=False, indent=1)
        print(f"Snapshot zapsán do {vystup} ({os.path.getsize(vystup)} B), bez POSTu.")
        return

    tajemstvi = nacti_tajemstvi()
    if not tajemstvi:
        print("CHYBA: REPORT_SECRET není k dispozici (env ani /etc/web-1p-report.env).", file=sys.stderr)
        sys.exit(1)
    telo = json.dumps(snapshot, ensure_ascii=False).encode()
    req = urllib.request.Request(SEO_URL, data=telo, method="POST", headers={
        "Authorization": f"Bearer {tajemstvi}",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        odpoved = json.load(r)
    print(f"{dt.datetime.now():%Y-%m-%d %H:%M} — SEO snapshot odeslán ({len(telo)} B, "
          f"indexace: {'ano' if s_indexaci else 'ne'}): {odpoved}")


if __name__ == "__main__":
    main()
