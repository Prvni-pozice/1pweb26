#!/usr/bin/env bash
# Týdenní souhrn poptávek z webu prvni-pozice.com.
#
# Co dělá: projde projekty v /data/bot/*/package.json, vytáhne u nich verzi Astra,
# porovná ji s aktuální verzí z npm registry a pošle vše na /api/tydenni-report.
# Samotný e-mail odesílá až Vercel (klíč k Resendu je jen tam, na serveru k němu není přístup).
#
# Tajemství: proměnná prostředí REPORT_SECRET, nebo soubor /etc/web-1p-report.env
# (řádek `REPORT_SECRET=...`, práva 600, root:root). Soubor NEPATŘÍ do gitu.
#
# Cron (pondělí 7:05):
#   5 7 * * 1 /data/bot/web-1P/scripts/tydenni-report.sh >> /var/log/web-1p-report.log 2>&1

set -euo pipefail

PROJEKTY_GLOB="/data/bot/*/package.json"
ENV_SOUBOR="/etc/web-1p-report.env"
URL="${REPORT_URL:-https://www.prvni-pozice.com/api/tydenni-report}"

# — tajemství —
if [[ -z "${REPORT_SECRET:-}" && -r "$ENV_SOUBOR" ]]; then
  # shellcheck disable=SC1090
  set -a; . "$ENV_SOUBOR"; set +a
fi
if [[ -z "${REPORT_SECRET:-}" ]]; then
  echo "CHYBA: REPORT_SECRET není nastavené (ani v prostředí, ani v $ENV_SOUBOR)." >&2
  exit 1
fi

# — aktuální verze Astra z npm registry (jeden dotaz stačí pro všechny projekty) —
nejnovejsi=$(curl -fsS --max-time 20 https://registry.npmjs.org/astro/latest \
  | grep -o '"version":"[^"]*"' | head -1 | cut -d'"' -f4)
if [[ -z "$nejnovejsi" ]]; then
  echo "CHYBA: nepodařilo se zjistit aktuální verzi Astra z npm registry." >&2
  exit 1
fi
nejnovejsi_major="${nejnovejsi%%.*}"

# — projekty s Astrem —
polozky=()
souhrn=()
for pkg in $PROJEKTY_GLOB; do
  [[ -r "$pkg" ]] || continue
  projekt=$(basename "$(dirname "$pkg")")

  # verze Astra z dependencies i devDependencies; hodnota musí začínat číslem
  # (případně po ^ ~ >= …), aby se nechytil řádek "astro": "astro" ze scripts
  verze=$(grep -o '"astro"[[:space:]]*:[[:space:]]*"[^"0-9]*[0-9][^"]*"' "$pkg" \
    | head -1 | cut -d'"' -f4 || true)
  [[ -n "$verze" ]] || continue

  cista="${verze#"${verze%%[0-9]*}"}"   # pryč s ^ ~ >= a mezerami
  major="${cista%%.*}"
  if [[ "$major" == "$nejnovejsi_major" ]]; then aktualni=true; else aktualni=false; fi

  polozky+=("{\"projekt\":\"$projekt\",\"verze\":\"$verze\",\"nejnovejsi\":\"$nejnovejsi\",\"aktualni\":$aktualni}")
  souhrn+=("$projekt: $verze (nejnovější $nejnovejsi) — $([[ $aktualni == true ]] && echo aktuální || echo ZASTARALÉ)")
done

# — JSON payload —
IFS=,; astro_json="${polozky[*]:-}"; unset IFS
payload="{\"astro\":[$astro_json]}"

# — odeslání —
telo=$(mktemp)
trap 'rm -f "$telo"' EXIT
kod=$(curl -sS --max-time 30 -o "$telo" -w '%{http_code}' \
  -X POST "$URL" \
  -H "Authorization: Bearer $REPORT_SECRET" \
  -H 'Content-Type: application/json' \
  --data "$payload")

echo "$(date '+%Y-%m-%d %H:%M') — týdenní report odeslán na $URL (HTTP $kod)"
echo "Astro projekty (${#polozky[@]}):"
if [[ ${#souhrn[@]} -gt 0 ]]; then printf '  - %s\n' "${souhrn[@]}"; else echo "  (žádný projekt s Astrem)"; fi
echo "Odpověď: $(cat "$telo")"

[[ "$kod" == "200" ]] || { echo "CHYBA: server nevrátil 200." >&2; exit 1; }
