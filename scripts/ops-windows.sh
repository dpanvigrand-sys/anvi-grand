#!/usr/bin/env bash
# Open ANVI OPS screens as 4 separate Chrome windows (2×2) on Try Live.
set -euo pipefail
export DISPLAY="${DISPLAY:-:1}"
PORT="${ANVI_PORT:-3947}"
BASE="http://127.0.0.1:${PORT}"
PASS="${ANVI_OPS_PASSWORD:-anviops2026}"
PROFILE="${ANVI_OPS_CHROME_PROFILE:-/tmp/chrome-anvi-ops-windows}"
CHROME_BIN="$(command -v google-chrome-stable || command -v google-chrome || command -v chromium-browser)"
STORE_MEDIA="/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163/media"
PROOF="${STORE_MEDIA}/ops-windows.jpg"

mkdir -p "$PROFILE" "$STORE_MEDIA"

# Screen geometry → tight 2×2
SW=1920
SH=1200
GAP=10
W=$(( (SW - GAP * 3) / 2 ))
H=$(( (SH - GAP * 3) / 2 ))
X1=$GAP
Y1=$GAP
X2=$(( GAP * 2 + W ))
Y2=$(( GAP * 2 + H ))

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
  sleep 1.0
}

# Close prior ops-windows profile chrome only (leave guest Try Live chrome alone)
pkill -f "user-data-dir=${PROFILE}" 2>/dev/null || true
sleep 0.8

# Minimize other visible Chrome windows so the 2×2 is clear
while read -r wid; do
  [ -n "$wid" ] || continue
  DISPLAY=:1 xdotool windowminimize "$wid" 2>/dev/null || true
done < <(DISPLAY=:1 xdotool search --onlyvisible --class google-chrome 2>/dev/null || true)

# Unlock via ?unlock= so each window opens past the gate
launch_win "${BASE}/ops?unlock=${PASS}" "$X1" "$Y1" "$W" "$H"
launch_win "${BASE}/ops/admin?unlock=${PASS}" "$X2" "$Y1" "$W" "$H"
launch_win "${BASE}/ops/reception?unlock=${PASS}" "$X1" "$Y2" "$W" "$H"
launch_win "${BASE}/ops/kitchen?unlock=${PASS}" "$X2" "$Y2" "$W" "$H"

sleep 2.5

# Force-arrange ops profile windows into 2×2 (Chrome sometimes ignores --window-position)
mapfile -t WIDS < <(DISPLAY=:1 xdotool search --class google-chrome 2>/dev/null | while read -r id; do
  pid=$(DISPLAY=:1 xdotool getwindowpid "$id" 2>/dev/null || echo "")
  [ -z "$pid" ] && continue
  if tr '\0' ' ' <"/proc/$pid/cmdline" 2>/dev/null | grep -q "user-data-dir=${PROFILE}"; then
    echo "$id"
  fi
done)

# Prefer newest 4 window ids
if [ "${#WIDS[@]}" -ge 4 ]; then
  # Order: try match by WM_NAME / URL title if possible; else place last 4
  TARGETS=("${WIDS[@]: -4}")
  POS=(
    "$X1 $Y1"
    "$X2 $Y1"
    "$X1 $Y2"
    "$X2 $Y2"
  )
  # Best-effort: map by page title keywords
  declare -A SLOT
  for id in "${TARGETS[@]}"; do
    name=$(DISPLAY=:1 xdotool getwindowname "$id" 2>/dev/null || echo "")
    case "$name" in
      *[Hh]ub*|*[Ss]taff*|*/ops\ *|*Ops*)
        # hub often titled with ANVI / Staff
        if [[ -z "${SLOT[hub]:-}" ]] && [[ "$name" != *[Aa]dmin* && "$name" != *[Rr]eception* && "$name" != *[Kk]itchen* && "$name" != *KT* ]]; then
          SLOT[hub]=$id
          continue
        fi
        ;;
    esac
    case "$name" in
      *[Aa]dmin*) SLOT[admin]=$id ;;
      *[Rr]eception*) SLOT[reception]=$id ;;
      *[Kk]itchen*|*"KT"*) SLOT[kitchen]=$id ;;
      *) : ;;
    esac
  done

  ORDER=()
  for key in hub admin reception kitchen; do
    if [ -n "${SLOT[$key]:-}" ]; then
      ORDER+=("${SLOT[$key]}")
    fi
  done
  # Fallback to raw order if titles didn't map
  if [ "${#ORDER[@]}" -lt 4 ]; then
    ORDER=("${TARGETS[@]}")
  fi

  i=0
  for id in "${ORDER[@]}"; do
    read -r x y <<<"${POS[$i]}"
    DISPLAY=:1 xdotool windowactivate --sync "$id" 2>/dev/null || true
    DISPLAY=:1 xdotool windowmove "$id" "$x" "$y" 2>/dev/null || true
    DISPLAY=:1 xdotool windowsize "$id" "$W" "$H" 2>/dev/null || true
    i=$((i + 1))
    [ "$i" -ge 4 ] && break
  done
fi

sleep 1.2

# Capture proof JPEG ≤150KB
TMP_PNG="/tmp/ops-windows-proof.png"
DISPLAY=:1 scrot -o "$TMP_PNG" 2>/dev/null || DISPLAY=:1 import -window root "$TMP_PNG"
python3 - <<'PY'
from PIL import Image
from pathlib import Path
src = Path("/tmp/ops-windows-proof.png")
dst = Path("/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163/media/ops-windows.jpg")
im = Image.open(src).convert("RGB")
# shrink width for chat-friendly size
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

echo "[ops-windows] launched hub/admin/reception/kitchen 2×2 on :${PORT}"
echo "[ops-windows] proof → ${PROOF}"
