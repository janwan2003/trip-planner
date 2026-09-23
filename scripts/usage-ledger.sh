#!/usr/bin/env bash
# Print the daily usage ledger as a markdown table, for pasting into CLAUDE.md.
#
#   scripts/usage-ledger.sh [since-date]      # default 2026-09-02, first real user
#
# Trips and participants come from production D1; the eight test trips listed in
# CLAUDE.md are excluded by id. Traffic comes from the Cloudflare GraphQL API.
# Read-only: every statement here is a SELECT. Prints counts only, never names.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a

SINCE="${1:-2026-09-02}"
ACCOUNT=befecce350e8a99e624e87de9aca2099
ZONE=6839a05d9ac236e9897b253b95ecbbda
DB=39bb1ce4-bc4a-4047-823a-6255e2c472bb
TEST="'prodsmoke0000000000000000000001','prodtouch000000000000000000000001',\
'prodverify00000000000000000000001','e1e0ba393081baeec0d2b15dd5698274',\
'f32fef50dfd4a743b62ac63ae3a65f96','cbe96f2ef90cab8a36c5a39d1888c782',\
'f89ae94e17e1a9630204a34aacb33d52','4b58069109c6bede14bdef059785b783'"

d1() {
  curl -sf -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/d1/database/$DB/query" \
    -H "Authorization: Bearer $CLOUDFLARE" -H 'Content-Type: application/json' \
    --data "$(jq -n --arg s "$1" '{sql:$s}')" | jq -c '.result[0].results'
}
gql() {
  curl -sf https://api.cloudflare.com/client/v4/graphql \
    -H "Authorization: Bearer $1" -H 'Content-Type: application/json' \
    --data "$(jq -n --arg q "$2" '{query:$q}')"
}

trips=$(d1 "SELECT substr(created_at,1,10) d, count(*) n FROM trips
  WHERE id NOT IN ($TEST) AND created_at >= '$SINCE' GROUP BY d")
joins=$(d1 "SELECT substr(created_at,1,10) d, count(*) n FROM participants
  WHERE trip_id NOT IN ($TEST) AND created_at >= '$SINCE' GROUP BY d")
totals=$(d1 "SELECT
  (SELECT count(*) FROM trips WHERE id NOT IN ($TEST)) trips,
  (SELECT count(*) FROM participants WHERE trip_id NOT IN ($TEST)) participants,
  (SELECT count(*) FROM (SELECT t.id FROM trips t JOIN participants p ON p.trip_id = t.id
     WHERE t.id NOT IN ($TEST) GROUP BY t.id HAVING count(*) >= 2)) shared,
  (SELECT count(DISTINCT trip_id) FROM participants
     WHERE trip_id NOT IN ($TEST) AND updated_at >= date('now','-7 days')) active7")
zone=$(gql "$CLOUDFLARE_ANALYTICS_TOKEN" "{viewer{zones(filter:{zoneTag:\"$ZONE\"}){
  httpRequests1dGroups(limit:1000,filter:{date_geq:\"$SINCE\"}){
  dimensions{date} sum{pageViews} uniq{uniques}}}}}" \
  | jq -c '[.data.viewer.zones[0].httpRequests1dGroups[] | {d:.dimensions.date, pv:.sum.pageViews, u:.uniq.uniques}]')
fn=$(gql "$CLOUDFLARE" "{viewer{accounts(filter:{accountTag:\"$ACCOUNT\"}){
  pagesFunctionsInvocationsAdaptiveGroups(limit:1000,filter:{date_geq:\"$SINCE\"}){
  dimensions{date} sum{requests}}}}}" \
  | jq -c '[.data.viewer.accounts[0].pagesFunctionsInvocationsAdaptiveGroups[] | {d:.dimensions.date, n:.sum.requests}]')

jq -rn --arg since "$SINCE" --argjson trips "$trips" --argjson joins "$joins" \
  --argjson zone "$zone" --argjson fn "$fn" --argjson tot "$totals" '
  def idx(a; k): reduce a[] as $r ({}; .[$r.d] = $r[k]);
  (idx($trips; "n")) as $t | (idx($joins; "n")) as $j | (idx($fn; "n")) as $f
  | (idx($zone; "pv")) as $pv | (idx($zone; "u")) as $u
  | ([$t, $j, $f, $pv] | map(keys[]) | unique | map(select(. >= $since)) | sort) as $days
  | "| date | trips created | participants joined | API calls | page views | uniques |",
    "| --- | --- | --- | --- | --- | --- |",
    ($days[] as $d | "| \($d) | \($t[$d] // 0) | \($j[$d] // 0) | \($f[$d] // 0) | \($pv[$d] // "-") | \($u[$d] // "-") |"),
    "",
    "Totals now: \($tot[0].trips) trips, \($tot[0].participants) participants; \($tot[0].shared) trips have 2+ participants; \($tot[0].active7) trips had a participant edit in the last 7 days."'
