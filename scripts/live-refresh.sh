#!/usr/bin/env bash
# ANVI GRAND — one-command Try Live browser update after every UI change.
#
# STANDING RULE (Telugu preference): ఏ update చేసినా వెంటనే browser lo automatic.
# User never presses refresh. Agent runs: npm run live:refresh
#
# Does: health-check → ensure Next on :3947 → open/focus Chrome on unlocked
# public /ops (fallback local) → hard reload → write media/shot.jpg
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${ANVI_PORT:-3947}"
PASS="${ANVI_OPS_PASSWORD:-anviops2026}"
STORE="/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163"
PUBLIC_URL_FILE="${ANVI_PUBLIC_URL_FILE:-$STORE/internal/public-url.txt}"
PUBLIC_URL_FALLBACK_FILE="$ROOT/.anvi-public-url"
SHOT="${ANVI_SHOT_PATH:-$STORE/media/shot.jpg}"
LOCAL_BASE="http://127.0.0.1:${PORT}"
LOCAL_OPS="${LOCAL_BASE}/ops?unlock=${PASS}"
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
  xdotool key --window "$wid" --clearmodifiers ctrl+l 2>/dev/null || true
  sleep 0.15
  xdotool type --window "$wid" --delay 6 --clearmodifiers "$url" 2>/dev/null || true
  xdotool key --window "$wid" --clearmodifiers Return 2>/dev/null || true
  sleep 1.2
  xdotool key --window "$wid" --clearmodifiers ctrl+shift+r 2>/dev/null || true
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
    node -e "
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome-stable',
    headless: true,
    args: ['--no-sandbox','--disable-dev-shm-usage']
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const url = process.env.ANVI_SHOT_URL || '${LOCAL_OPS}';
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

open_or_refresh_chrome() {
  resolve_chrome || return 1
  local pub_base pub_ops target
  pub_base="$(public_base || true)"
  pub_ops=""
  if [[ -n "$pub_base" ]]; then
    pub_ops="${pub_base}/ops?unlock=${PASS}"
  fi
  # Prefer public unlocked ops when healthy; else local unlocked ops
  target="$LOCAL_OPS"
  if [[ -n "$pub_ops" ]] && health_curl "$pub_ops"; then
    target="$pub_ops"
  else
    health_curl "$LOCAL_OPS" || true
  fi

  if command -v xdotool >/dev/null 2>&1; then
    local wid
    wid="$(xdotool search --onlyvisible --class 'google-chrome|Google-chrome|chromium' 2>/dev/null | head -1 || true)"
    if [[ -z "${wid:-}" ]]; then
      wid="$(xdotool search --onlyvisible --name 'ANVI|3947|ops|Chrome' 2>/dev/null | tail -1 || true)"
    fi
    if [[ -n "${wid:-}" ]]; then
      focus_maximize "$wid"
      xdotool key --window "$wid" --clearmodifiers ctrl+1 2>/dev/null || true
      sleep 0.2
      navigate_and_reload "$wid" "$target"
      if [[ -n "$pub_ops" && "$target" != "$pub_ops" ]]; then
        sleep 0.3
        xdotool key --window "$wid" --clearmodifiers ctrl+t 2>/dev/null || true
        sleep 0.2
        navigate_and_reload "$wid" "$pub_ops"
        xdotool key --window "$wid" --clearmodifiers ctrl+1 2>/dev/null || true
      fi
      focus_maximize "$wid"
      echo "[live:refresh] refreshed Chrome → $target"
      return 0
    fi
  fi

  local args=(
    --no-sandbox --test-type --disable-dev-shm-usage
    --use-gl=angle --use-angle=swiftshader-webgl
    --password-store=basic --no-first-run --no-default-browser-check
    --disable-session-crashed-bubble
    --user-data-dir=/home/ubuntu/.config/google-chrome
    --class=google-chrome --window-size=1820,1100 --window-position=50,50
    --start-maximized --new-window "$target"
  )
  if [[ -n "$pub_ops" && "$target" != "$pub_ops" ]]; then
    args+=("$pub_ops")
  elif [[ "$target" != "$LOCAL_OPS" ]]; then
    args+=("$LOCAL_OPS")
  fi
  nohup "$CHROME_BIN" "${args[@]}" >>/tmp/chrome-anvi-live.log 2>&1 &
  sleep 2.8
  if command -v xdotool >/dev/null 2>&1; then
    local wid
    wid="$(xdotool search --onlyvisible --class google-chrome 2>/dev/null | head -1 || true)"
    focus_maximize "${wid:-}"
  fi
  echo "[live:refresh] opened Chrome → $target"
}

ensure_server
open_or_refresh_chrome
capture_shot
echo "[live:refresh] DONE — user should see unlocked /ops without manual refresh"
echo "[live:refresh] shot=$SHOT"
echo "[live:refresh] local=$LOCAL_OPS"
pub="$(public_base || true)"
if [[ -n "$pub" ]]; then
  echo "[live:refresh] public=${pub}/ops?unlock=${PASS}"
fi
