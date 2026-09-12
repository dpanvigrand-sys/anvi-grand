#!/usr/bin/env bash
# Open ANVI OPS screens as separate Chrome windows on Try Live.
set -euo pipefail
export DISPLAY="${DISPLAY:-:1}"
PORT="${ANVI_PORT:-3947}"
BASE="http://127.0.0.1:${PORT}"
PROFILE="${ANVI_OPS_CHROME_PROFILE:-/tmp/chrome-anvi-ops-windows}"
CHROME_BIN="$(command -v google-chrome-stable || command -v google-chrome || command -v chromium-browser)"

mkdir -p "$PROFILE"

# Seed unlock cookie/localStorage via a tiny helper page served by Next is hard;
# instead open hub first; agent types password once. Windows share PROFILE.

launch_win() {
  local url="$1" x="$2" y="$3" w="$4" h="$5"
  "$CHROME_BIN" \
    --user-data-dir="$PROFILE" \
    --no-first-run \
    --no-default-browser-check \
    --disable-session-crashed-bubble \
    --no-sandbox \
    --test-type \
    --disable-dev-shm-usage \
    --window-position="$x,$y" \
    --window-size="$w,$h" \
    --new-window \
    "$url" >/tmp/chrome-ops-win.log 2>&1 &
  sleep 0.8
}

# Close prior ops-windows profile chrome only
pkill -f "user-data-dir=${PROFILE}" 2>/dev/null || true
sleep 0.5

# 2x2 grid of windows
launch_win "${BASE}/ops" 40 40 920 560
launch_win "${BASE}/ops/admin" 980 40 920 560
launch_win "${BASE}/ops/reception" 40 620 920 540
launch_win "${BASE}/ops/kitchen" 980 620 920 540

echo "[ops-windows] launched hub/admin/reception/kitchen on :${PORT}"
