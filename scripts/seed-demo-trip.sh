#!/usr/bin/env bash
# Seeds the demo trip the marketing screenshots are taken from.
#
#   pnpm run build && pnpm exec wrangler pages dev --port 8794 --ip 127.0.0.1
#   scripts/seed-demo-trip.sh [base-url]
#
# Against a LOCAL wrangler and its local D1 - never production, so no demo data ever
# lands in the live database. Six people, all free Fri 11 to Mon 14 December, with
# partial overlaps around it so the ranking has something to rank.
set -euo pipefail

BASE="${1:-http://127.0.0.1:8794}"
API="$BASE/api/trips"
TRIP=alps26

curl -sS -X POST "$API" -H 'content-type: application/json' \
  -d "{\"id\":\"$TRIP\",\"name\":\"Ski week in the Alps\",\"startDate\":\"2026-12-04\",\"endDate\":\"2026-12-27\"}" \
  -o /dev/null -w "trip %{http_code}\n"

add() {
  curl -sS -X PUT "$API/$TRIP/participants" -H 'content-type: application/json' \
    -d "{\"name\":\"$1\",\"availableDates\":$2}" -o /dev/null -w "$1 %{http_code}\n"
}

add "Ada"   '["2026-12-04","2026-12-05","2026-12-06","2026-12-10","2026-12-11","2026-12-12","2026-12-13","2026-12-14","2026-12-15","2026-12-19","2026-12-20"]'
add "Ben"   '["2026-12-11","2026-12-12","2026-12-13","2026-12-14","2026-12-15","2026-12-16","2026-12-17","2026-12-18","2026-12-19","2026-12-20"]'
add "Chidi" '["2026-12-05","2026-12-06","2026-12-11","2026-12-12","2026-12-13","2026-12-14","2026-12-18","2026-12-19","2026-12-20","2026-12-26","2026-12-27"]'
add "Dana"  '["2026-12-10","2026-12-11","2026-12-12","2026-12-13","2026-12-14","2026-12-15","2026-12-16","2026-12-19","2026-12-20"]'
add "Elif"  '["2026-12-04","2026-12-11","2026-12-12","2026-12-13","2026-12-14","2026-12-19","2026-12-20","2026-12-21"]'
add "Frank" '["2026-12-06","2026-12-11","2026-12-12","2026-12-13","2026-12-14","2026-12-15","2026-12-25","2026-12-26","2026-12-27"]'

echo "seeded: $BASE/trip/$TRIP"
