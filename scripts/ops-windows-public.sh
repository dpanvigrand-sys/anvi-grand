#!/usr/bin/env bash
# Open ANVI OPS on the PUBLIC Cloudflare base as 4 separate Chrome windows (2×2).
# For Try Live proof on the cloud desktop — not the user's laptop.
set -euo pipefail
export DISPLAY="${DISPLAY:-:1}"

BASE="${ANVI_PUBLIC_BASE:-https://menus-weblog-cyber-behavior.trycloudflare.com}"
PASS="${ANVI_OPS_PASSWORD:-anviops2026}"
PROFILE="${ANVI_OPS_PUBLIC_CHROME_PROFILE:-/tmp/chrome-anvi-ops-public}"
CHROME_BIN="$(command -v google-chrome-stable || command -v google-chrome || command -v chromium-browser)"
STORE_MEDIA="/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163/media"
PROOF="${STORE_MEDIA}/ops-windows.jpg"

mkdir -p "$PROFILE" "$STORE_MEDIA"

# Verify tunnel before opening
for p in /ops /ops/admin /ops/reception /ops/kitchen; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "${BASE}${p}" || echo "000")
  if [ "$code" != "200" ]; then
    echo "[ops-windows-public] FAIL ${code} ${BASE}${p}" >&2
    exit 1
  fi
  echo "[ops-windows-public] OK ${code} ${BASE}${p}"
done

SW=1920; SH=1200; GAP=10
W=$(( (SW - GAP * 3) / 2 ))
H=$(( (SH - GAP * 3) / 2 ))
X1=$GAP; Y1=$GAP
X2=$(( GAP * 2 + W )); Y2=$(( GAP * 2 + H ))

pkill -f "user-data-dir=${PROFILE}" 2>/dev/null || true
pkill -f "user-data-dir=/tmp/chrome-anvi-ops-windows" 2>/dev/null || true
sleep 0.8

while read -r wid; do
  [ -n "$wid" ] || continue
  xdotool windowminimize "$wid" 2>/dev/null || true
done < <(xdotool search --onlyvisible --class google-chrome 2>/dev/null || true)

launch_win() {
  local url="$1" x="$2" y="$3" w="$4" h="$5"
  "$CHROME_BIN" \
    --user-data-dir="$PROFILE" \
    --no-first-run --no-default-browser-check --disable-session-crashed-bubble \
    --no-sandbox --test-type --disable-dev-shm-usage \
    --window-position="$x,$y" --window-size="$w,$h" --new-window \
    "$url" >/tmp/chrome-ops-public.log 2>&1 &
  sleep 1.3
}

launch_win "${BASE}/ops?unlock=${PASS}" "$X1" "$Y1" "$W" "$H"
launch_win "${BASE}/ops/admin?unlock=${PASS}" "$X2" "$Y1" "$W" "$H"
launch_win "${BASE}/ops/reception?unlock=${PASS}" "$X1" "$Y2" "$W" "$H"
launch_win "${BASE}/ops/kitchen?unlock=${PASS}" "$X2" "$Y2" "$W" "$H"

# Give Cloudflare + React gate time to settle
sleep 6

mapfile -t WIDS < <(
  for id in $(xdotool search --class google-chrome 2>/dev/null); do
    pid=$(xdotool getwindowpid "$id" 2>/dev/null || echo "")
    [ -z "$pid" ] && continue
    if tr '\0' ' ' <"/proc/$pid/cmdline" 2>/dev/null | grep -q "user-data-dir=${PROFILE}"; then
      geo=$(xdotool getwindowgeometry --shell "$id" 2>/dev/null || true)
      w=$(echo "$geo" | sed -n 's/^WIDTH=//p')
      [ "${w:-0}" -lt 200 ] && continue
      echo "$id"
    fi
  done
)

echo "[ops-windows-public] windows=${#WIDS[@]}"
POS=("$X1 $Y1" "$X2 $Y1" "$X1 $Y2" "$X2 $Y2")
i=0
for id in "${WIDS[@]}"; do
  [ "$i" -ge 4 ] && break
  read -r x y <<<"${POS[$i]}"
  xdotool windowactivate --sync "$id" 2>/dev/null || true
  xdotool windowmove "$id" "$x" "$y" 2>/dev/null || true
  xdotool windowsize "$id" "$W" "$H" 2>/dev/null || true
  i=$((i + 1))
done

sleep 2
TMP_PNG=/tmp/ops-windows-proof.png
scrot -o "$TMP_PNG" 2>/dev/null || import -window root "$TMP_PNG"

python3 - <<'PY'
from PIL import Image
from pathlib import Path
src = Path("/tmp/ops-windows-proof.png")
dst = Path("/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163/media/ops-windows.jpg")
im = Image.open(src).convert("RGB")
w, h = im.size
max_w = 1280
if w > max_w:
    im = im.resize((max_w, int(h * max_w / w)), Image.Resampling.LANCZOS)
for q in (72, 60, 50, 40, 32):
    im.save(dst, "JPEG", quality=q, optimize=True)
    if dst.stat().st_size <= 150_000:
        break
print(f"wrote {dst} ({dst.stat().st_size} bytes) q={q}")
PY

echo "[ops-windows-public] BASE=${BASE}"
echo "[ops-windows-public] proof=${PROOF}"
echo "${BASE}/ops"
echo "${BASE}/ops/admin"
echo "${BASE}/ops/reception"
echo "${BASE}/ops/kitchen"
