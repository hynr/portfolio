#!/usr/bin/env bash
# Smoke check for the 13 game-mode sound files. Lists each event with its
# size and exits non-zero if any are missing or zero bytes.
#
# Run from the worktree root: ./scripts/check-audio.sh
#
# This isn't a unit test — there is no test runner in this project. It's a
# fast pre-deploy guardrail so we don't ship a build with a broken sounds/
# directory. The set of events comes from SoundEvent in lib/audio.ts; if
# you add an event there, add it here too.

set -euo pipefail

cd "$(dirname "$0")/.."

# event:extension pairs; extensions match the SOUND_EXT map in lib/audio.ts.
events=(
  "jump:wav"
  "land:wav"
  "block-hit:wav"
  "pause:wav"
  "enemy-stomp:wav"
  "footstep:wav"
  "damage:wav"
  "coin:m4a"
  "block-reveal:m4a"
  "pipe-enter:m4a"
  "level-complete:m4a"
  "die:m4a"
  "game-over:m4a"
)

fail=0
total=0

printf "%-18s %-5s %8s\n" "EVENT" "EXT" "BYTES"
printf "%-18s %-5s %8s\n" "------------------" "-----" "--------"

for entry in "${events[@]}"; do
  event="${entry%%:*}"
  ext="${entry##*:}"
  path="public/sounds/${event}.${ext}"

  if [[ ! -f "$path" ]]; then
    printf "%-18s %-5s %8s  MISSING\n" "$event" "$ext" "-"
    fail=1
    continue
  fi

  size=$(wc -c < "$path" | tr -d ' ')

  if [[ "$size" -eq 0 ]]; then
    printf "%-18s %-5s %8s  EMPTY\n" "$event" "$ext" "$size"
    fail=1
    continue
  fi

  total=$((total + size))
  printf "%-18s %-5s %8s\n" "$event" "$ext" "$size"
done

printf "\nTotal: %d bytes (%.1f KB)\n" "$total" "$(echo "scale=1; $total/1024" | bc)"

if [[ $fail -ne 0 ]]; then
  echo "FAIL: one or more sound files missing or empty" >&2
  exit 1
fi

echo "OK"
