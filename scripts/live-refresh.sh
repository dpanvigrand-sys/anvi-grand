#!/usr/bin/env bash
# ANVI GRAND — one-command Try Live browser update after every UI change.
#
# HARD RULE: After every update, Chrome MUST auto-show BOTH:
#   1. Ops hub — /ops?unlock=anviops2026
#   2. Frontend guest home — /
# No waiting for “continue”/“next”. User never presses refresh.
# Agent runs: npm run live:refresh
#
# Does: health-check → ensure Next on :3947 → open/focus Chrome on unlocked
# ops + guest home (public preferred, local :3947 fallback) → hard reload
# → write media/shot.jpg
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${ANVI_PORT:-3947}"
PASS="${ANVI_OPS_PASSWORD:-anviops2026}"
STORE="/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163"
PUBLIC_URL_FILE="${ANVI_PUBLIC_URL_FILE:-$STORE/internal/public-url.txt}"
PUBLIC_URL_DOC="${ANVI_PUBLIC_URL_DOC:-$STORE/docs/public-url.md}"
PUBLIC_URL_FALLBACK_FILE="$ROOT/.anvi-public-url"
SHOT="${ANVI_SHOT_PATH:-$STORE/media/shot.jpg}"
LOCAL_BASE="http://127.0.0.1:${PORT}"
LOCAL_OPS="${LOCAL_BASE}/ops?unlock=${PASS}"
LOCAL_HOME="${LOCAL_BASE}/"
export DISPLAY="${DISPLAY:-:1}"
LOG=/tmp/anvi-live.log

cd "$ROOT"

resolve_chrome() {
  CHROME_BIN="${CHROME_BIN:-}"
  if [[ -n "$CHROME_BIN" && -x "$CHROME_BIN" ]]; then
    return 0
  fi
  for c in google-chrome-stable google-chrome chromium-browser chromium; do
    if command -v "$c" >/dev/null 2>&1; then
      CHROME_BIN="$(command -v "$c")"
      return 0
    fi
  done
  echo "[live:refresh] Chrome/Chromium not found" >&2
  return 1
}

public_base() {
  local u=""
  if [[ -f "$PUBLIC_URL_FILE" ]]; then
    u="$(grep -m1 -E '^https://' "$PUBLIC_URL_FILE" 2>/dev/null | tr -d '[:space:]' || true)"
  fi
  if [[ -z "$u" && -f "$PUBLIC_URL_DOC" ]]; then
    u="$(grep -m1 -E 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$PUBLIC_URL_DOC" 2>/dev/null | grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' | head -1 || true)"
  fi
  if [[ -z "$u" && -f "$ROOT/docs/public-url.md" ]]; then
    u="$(grep -m1 -E 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$ROOT/docs/public-url.md" 2>/dev/null | grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' | head -1 || true)"
  fi
  if [[ -z "$u" && -f "$PUBLIC_URL_FALLBACK_FILE" ]]; then
    u="$(grep -m1 -E '^https://' "$PUBLIC_URL_FALLBACK_FILE" 2>/dev/null | tr -d '[:space:]' || true)"
  fi
  if [[ "$u" == https://* ]]; then
    printf '%s' "${u%/}"
  fi
}

site_ok() {
  local code
  code=$(curl -s -o /tmp/anvi-live-check.html -w "%{http_code}" --max-time 4 "${LOCAL_BASE}/" || echo 000)
  [[ "$code" == "200" ]] && grep -qi "ANVI" /tmp/anvi-live-check.html
}

health_curl() {
  local target="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 12 "$target" || echo 000)
  echo "[live:refresh] health ${code} ${target}"
  [[ "$code" == "200" ]]
}

ensure_server() {
  if site_ok; then
    echo "[live:refresh] server OK on ${LOCAL_BASE}/"
    return 0
  fi
  echo "[live:refresh] starting production server on ${PORT}…"
  pkill -f "next-server|next start|next dev" 2>/dev/null || true
  fuser -k "${PORT}/tcp" 2>/dev/null || true
  sleep 1
  if [[ ! -f .next/BUILD_ID ]]; then
    echo "[live:refresh] building…"
    npm run build >>"$LOG" 2>&1
  fi
  nohup npx next start --hostname 0.0.0.0 --port "$PORT" >>"$LOG" 2>&1 &
  for i in $(seq 1 50); do
    sleep 0.5
    if site_ok; then
      echo "[live:refresh] server ready ($i)"
      return 0
    fi
  done
  echo "[live:refresh] FAILED to start — see $LOG" >&2
  return 1
}

focus_maximize() {
  local wid="${1:-}"
  [[ -z "$wid" ]] && return 1
  xdotool windowactivate --sync "$wid" 2>/dev/null || true
  wmctrl -i -a "$wid" 2>/dev/null || true
  wmctrl -i -r "$wid" -b add,maximized_vert,maximized_horz 2>/dev/null || true
}

navigate_and_reload() {
  local wid="$1" url="$2"
  # Prefer clipboard paste (faster/more reliable than xdotool type for long URLs)
  if command -v xclip >/dev/null 2>&1; then
    printf '%s' "$url" | xclip -selection clipboard 2>/dev/null || true
  elif command -v xsel >/dev/null 2>&1; then
    printf '%s' "$url" | xsel --clipboard --input 2>/dev/null || true
  fi
  xdotool key --window "$wid" --clearmodifiers ctrl+l 2>/dev/null || true
  sleep 0.12
  if command -v xclip >/dev/null 2>&1 || command -v xsel >/dev/null 2>&1; then
    xdotool key --window "$wid" --clearmodifiers ctrl+v 2>/dev/null || true
  else
    xdotool type --window "$wid" --delay 5 --clearmodifiers "$url" 2>/dev/null || true
  fi
  xdotool key --window "$wid" --clearmodifiers Return 2>/dev/null || true
  sleep 1.2
  xdotool key --window "$wid" --clearmodifiers ctrl+shift+r 2>/dev/null || true
}

# Open/refocus a Chrome window on $url. Prefer an existing visible window
# matching $name_hint; else open a new maximized window.
open_window_on_url() {
  local url="$1"
  local name_hint="${2:-}"
  local wid=""

  if command -v xdotool >/dev/null 2>&1; then
    if [[ -n "$name_hint" ]]; then
      wid="$(xdotool search --onlyvisible --name "$name_hint" 2>/dev/null | tail -1 || true)"
    fi
    if [[ -z "${wid:-}" ]]; then
      # Prefer a free Chrome window we can retarget; if none, open new.
      wid=""
    fi
  fi

  if [[ -n "${wid:-}" ]]; then
    focus_maximize "$wid"
    sleep 0.2
    navigate_and_reload "$wid" "$url"
    focus_maximize "$wid"
    echo "[live:refresh] refreshed window → $url"
    return 0
  fi

  resolve_chrome || return 1
  nohup "$CHROME_BIN" \
    --no-sandbox --test-type --disable-dev-shm-usage \
    --use-gl=angle --use-angle=swiftshader-webgl \
    --password-store=basic --no-first-run --no-default-browser-check \
    --disable-session-crashed-bubble \
    --user-data-dir=/home/ubuntu/.config/google-chrome \
    --class=google-chrome --window-size=1400,900 --window-position=40,40 \
    --start-maximized --new-window "$url" \
    >>/tmp/chrome-anvi-live.log 2>&1 &
  sleep 2.2
  if command -v xdotool >/dev/null 2>&1; then
    wid="$(xdotool search --onlyvisible --class google-chrome 2>/dev/null | tail -1 || true)"
    focus_maximize "${wid:-}"
  fi
  echo "[live:refresh] opened window → $url"
}

capture_shot() {
  mkdir -p "$(dirname "$SHOT")"
  local tmp=/tmp/anvi-shot-raw.png
  sleep 1.5
  if command -v scrot >/dev/null 2>&1; then
    scrot -o "$tmp" 2>/dev/null || true
  fi
  if [[ ! -s "$tmp" ]] && command -v import >/dev/null 2>&1; then
    import -window root "$tmp" 2>/dev/null || true
  fi
  if [[ ! -s "$tmp" ]]; then
    # Playwright fallback (headless chrome) — always works in cloud VM
    # Prefer ops shot; ANVI_SHOT_URL can override.
    node -e "
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome-stable',
    headless: true,
    args: ['--no-sandbox','--disable-dev-shm-usage']
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const url = process.env.ANVI_SHOT_URL || '${OPS_URL}';
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/anvi-shot-raw.png', fullPage: false });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
" || true
  fi
  if [[ ! -s "$tmp" ]]; then
    echo "[live:refresh] WARN: no screenshot captured" >&2
    return 0
  fi
  if command -v ffmpeg >/dev/null 2>&1; then
    ffmpeg -y -i "$tmp" -vf "scale=1280:-1" -q:v 5 -update 1 "$SHOT" >/tmp/anvi-shot-ffmpeg.log 2>&1 || true
  fi
  if python3 -c 'import PIL' 2>/dev/null; then
    python3 - <<PY
from PIL import Image
from pathlib import Path
src = Path("/tmp/anvi-shot-raw.png")
dst = Path("$SHOT")
im = Image.open(src).convert("RGB")
w, h = im.size
max_w = 1280
if w > max_w:
    im = im.resize((max_w, int(h * max_w / w)), Image.Resampling.LANCZOS)
for q in (72, 60, 50, 40, 32):
    im.save(dst, "JPEG", quality=q, optimize=True)
    if dst.stat().st_size <= 180_000:
        break
print(f"[live:refresh] shot {dst} ({dst.stat().st_size} bytes) q={q}")
PY
  elif [[ -s "$SHOT" ]]; then
    echo "[live:refresh] shot $SHOT ($(wc -c <"$SHOT") bytes)"
  fi
}

# Resolve ops + guest targets (public preferred when healthy).
# Use GUEST_URL (never HOME) so a polluted $HOME env cannot break paths.
resolve_targets() {
  local pub_base
  pub_base="$(public_base || true)"
  OPS_URL="$LOCAL_OPS"
  GUEST_URL="$LOCAL_HOME"
  if [[ -n "$pub_base" ]]; then
    local pub_ops="${pub_base}/ops?unlock=${PASS}"
    local pub_guest="${pub_base}/"
    if health_curl "$pub_ops"; then
      OPS_URL="$pub_ops"
    else
      health_curl "$LOCAL_OPS" || true
    fi
    if health_curl "$pub_guest"; then
      GUEST_URL="$pub_guest"
    else
      health_curl "$LOCAL_HOME" || true
    fi
  else
    health_curl "$LOCAL_OPS" || true
    health_curl "$LOCAL_HOME" || true
  fi
  echo "[live:refresh] OPS_URL=$OPS_URL"
  echo "[live:refresh] GUEST_URL=$GUEST_URL"
}

chrome_common_args() {
  CHROME_COMMON=(
    --no-sandbox --test-type --disable-dev-shm-usage
    --use-gl=angle --use-angle=swiftshader-webgl
    --password-store=basic --no-first-run --no-default-browser-check
    --disable-session-crashed-bubble
    --user-data-dir=/home/ubuntu/.config/google-chrome
    --class=google-chrome
  )
}

# Open BOTH screens as two Chrome windows (ops + guest). Always required.
open_or_refresh_chrome() {
  resolve_chrome || return 1
  resolve_targets
  chrome_common_args

  # Launch/refocus TWO windows so both screens are visible without continue/next.
  nohup "$CHROME_BIN" "${CHROME_COMMON[@]}" \
    --window-size=1280,900 --window-position=20,40 \
    --new-window "$OPS_URL" \
    >>/tmp/chrome-anvi-live.log 2>&1 &
  sleep 1.6
  nohup "$CHROME_BIN" "${CHROME_COMMON[@]}" \
    --window-size=1280,900 --window-position=340,80 \
    --new-window "$GUEST_URL" \
    >>/tmp/chrome-anvi-live.log 2>&1 &
  sleep 2.4

  if command -v xdotool >/dev/null 2>&1; then
    local wids ops_wid guest_wid
    mapfile -t wids < <(xdotool search --onlyvisible --class 'google-chrome|Google-chrome|chromium' 2>/dev/null || true)
    # Navigate existing windows if Chrome reused a single process window
    if [[ ${#wids[@]} -ge 1 ]]; then
      ops_wid="${wids[0]}"
      focus_maximize "$ops_wid"
      navigate_and_reload "$ops_wid" "$OPS_URL"
    fi
    if [[ ${#wids[@]} -ge 2 ]]; then
      guest_wid="${wids[1]}"
      focus_maximize "$guest_wid"
      navigate_and_reload "$guest_wid" "$GUEST_URL"
      # Bring ops frontmost for shot.jpg
      focus_maximize "$ops_wid"
      navigate_and_reload "$ops_wid" "$OPS_URL"
    elif [[ ${#wids[@]} -eq 1 ]]; then
      # Single window: tab1 ops, tab2 guest
      focus_maximize "$ops_wid"
      xdotool key --window "$ops_wid" --clearmodifiers ctrl+1 2>/dev/null || true
      sleep 0.15
      navigate_and_reload "$ops_wid" "$OPS_URL"
      xdotool key --window "$ops_wid" --clearmodifiers ctrl+t 2>/dev/null || true
      sleep 0.2
      navigate_and_reload "$ops_wid" "$GUEST_URL"
      xdotool key --window "$ops_wid" --clearmodifiers ctrl+1 2>/dev/null || true
      focus_maximize "$ops_wid"
    fi
  fi

  echo "[live:refresh] opened Chrome → ops + guest home (both required)"
  echo "[live:refresh]   ops:   $OPS_URL"
  echo "[live:refresh]   guest: $GUEST_URL"
}

OPS_URL="$LOCAL_OPS"
GUEST_URL="$LOCAL_HOME"

ensure_server
open_or_refresh_chrome
capture_shot
echo "[live:refresh] DONE — ops + guest home open (no manual refresh / continue)"
echo "[live:refresh] shot=$SHOT"
echo "[live:refresh] local_ops=$LOCAL_OPS"
echo "[live:refresh] local_home=$LOCAL_HOME"
echo "[live:refresh] ops=$OPS_URL"
echo "[live:refresh] guest=$GUEST_URL"
