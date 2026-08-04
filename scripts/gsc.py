#!/usr/bin/env python3
"""Google Search Console API klient bez externích závislostí.

Autentizace přes service account JSON klíč (~/.config/gsc/key.json),
RS256 podpis JWT přes openssl.

Použití:
  python3 scripts/gsc.py sites                  # ověření připojení, seznam properties
  python3 scripts/gsc.py inspect <url> [...]    # index status konkrétních URL
  python3 scripts/gsc.py audit <out.tsv>        # index status všech URL ze sitemap
"""
import base64
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request

KEY_PATH = os.path.expanduser("~/.config/gsc/key.json")
SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
TOKEN_URL = "https://oauth2.googleapis.com/token"
SITE_URL = "sc-domain:prvni-pozice.com"
SITEMAP_URL = "https://www.prvni-pozice.com/sitemap-0.xml"


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def get_token() -> str:
    key = json.load(open(KEY_PATH))
    now = int(time.time())
    header = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claims = b64url(json.dumps({
        "iss": key["client_email"],
        "scope": SCOPE,
        "aud": TOKEN_URL,
        "iat": now,
        "exp": now + 3600,
    }).encode())
    signing_input = f"{header}.{claims}".encode()

    with tempfile.NamedTemporaryFile() as df, tempfile.NamedTemporaryFile() as kf:
        df.write(signing_input); df.flush()
        kf.write(key["private_key"].encode()); kf.flush()
        sig = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", kf.name, df.name],
            capture_output=True, check=True).stdout

    jwt = f"{header}.{claims}.{b64url(sig)}"
    body = urllib.parse.urlencode({
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt,
    }).encode()
    req = urllib.request.Request(TOKEN_URL, data=body)
    with urllib.request.urlopen(req) as r:
        return json.load(r)["access_token"]


def api(method: str, url: str, token: str, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "sites"
    token = get_token()

    if cmd == "sites":
        out = api("GET", "https://www.googleapis.com/webmasters/v3/sites", token)
        print(json.dumps(out, indent=2, ensure_ascii=False))
    elif cmd == "inspect":
        for url in sys.argv[2:]:
            out = api("POST",
                      "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                      token,
                      {"inspectionUrl": url, "siteUrl": SITE_URL})
            result = out["inspectionResult"]["indexStatusResult"]
            print(f"{url}\t{result.get('coverageState')}\t{result.get('verdict')}")
    elif cmd == "audit":
        out_path = sys.argv[2] if len(sys.argv) > 2 else "gsc-audit.tsv"
        import re
        from concurrent.futures import ThreadPoolExecutor
        xml = urllib.request.urlopen(SITEMAP_URL).read().decode()
        urls = re.findall(r"<loc>(.*?)</loc>", xml)
        print(f"{len(urls)} URL v sitemap, kontroluji…", file=sys.stderr)

        def inspect(url):
            try:
                out = api("POST",
                          "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                          token,
                          {"inspectionUrl": url, "siteUrl": SITE_URL})
                r = out["inspectionResult"]["indexStatusResult"]
                return (url, r.get("verdict", ""), r.get("coverageState", ""),
                        r.get("lastCrawlTime", ""))
            except Exception as e:
                return (url, "ERROR", str(e)[:120], "")

        with ThreadPoolExecutor(max_workers=6) as ex:
            rows = list(ex.map(inspect, urls))

        with open(out_path, "w") as f:
            f.write("url\tverdict\tcoverage\tlast_crawl\n")
            for row in rows:
                f.write("\t".join(row) + "\n")

        from collections import Counter
        for state, n in Counter(r[2] for r in rows).most_common():
            print(f"{n:4d}  {state}")
        print(f"\nUloženo do {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
