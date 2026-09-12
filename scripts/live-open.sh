#!/usr/bin/env bash
# ANVI GRAND — always-on Try Live desktop helper.
#
# STANDING RULE: After EVERY code/content update, run this (npm run live / live:refresh).
# The user never opens the site. Agent opens/refreshes Chrome maximized + frontmost.
#
# Usage: scripts/live-open.sh [open|ensure|refresh|restart [--rebuild]]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${ANVI_PORT:-3947}"
URL="http://127.0.0.1:${PORT}/"
export DISPLAY="${DISPLAY:-:1}"
LOG=/tmp/anvi-live.log
CHROME_BIN="${CHROME_BIN:-}"
PUBLIC_URL_FILE="${ANVI_PUBLIC_URL_FILE:-/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163/internal/public-url.txt}"
PUBLIC_URL_FALLBACK_FILE="$ROOT/.anvi-public-url"

cd "$ROOT"

resolve_chrome() {
  if [[ -n "$CHROME_BIN" && -x "$CHROME_BIN" ]]; then
    return 0
  fi
  for c in google-chrome-stable google-chrome chromium-browser chromium; do
    if command -v "$c" >/dev/null 2>&1; then
      CHROME_BIN="$(command -v "$c")"
      return 0
    fi
  done
  echo "[live] Chrome/Chromium not found" >&2
  return 1
}

public_url() {
  local u=""
  if [[ -f "$PUBLIC_URL_FILE" ]]; then
    u="$(tr -d '[:space:]' < "$PUBLIC_URL_FILE" || true)"
  fi
  if [[ -z "$u" && -f "$PUBLIC_URL_FALLBACK_FILE" ]]; then
    u="$(tr -d '[:space:]' < "$PUBLIC_URL_FALLBACK_FILE" || true)"
  fi
  # Only accept https trycloudflare / loca.lt style
  if [[ "$u" == https://* ]]; then
    printf '%s' "$u"
  fi
}

site_ok() {
  local code
  code=$(curl -s -o /tmp/anvi-live-check.html -w "%{http_code}" --max-time 4 "$URL" || echo 000)
  [[ "$code" == "200" ]] && grep -q "ANVI GRAND" /tmp/anvi-live-check.html
}

ensure_server() {
  if site_ok; then
    echo "[live] server OK on $URL"
    return 0
  fi
  echo "[live] starting production server on $PORT…"
  pkill -f "next-server|next start|next dev" 2>/dev/null || true
  fuser -k "${PORT}/tcp" 2>/dev/null || true
  sleep 1
  if [[ ! -f .next/BUILD_ID ]]; then
    echo "[live] building…"
    npm run build >>"$LOG" 2>&1
  fi
  nohup npx next start --hostname 0.0.0.0 --port "$PORT" >>"$LOG" 2>&1 &
  for i in $(seq 1 40); do
    sleep 0.5
    if site_ok; then
      echo "[live] server ready ($i)"
      return 0
    fi
  done
  echo "[live] FAILED to start — see $LOG" >&2
  return 1
}

focus_maximize() {
  local wid="${1:-}"
  if [[ -z "$wid" ]]; then
    return 1
  fi
  xdotool windowactivate --sync "$wid" 2>/dev/null || true
  wmctrl -i -a "$wid" 2>/dev/null || true
  wmctrl -i -r "$wid" -b add,maximized_vert,maximized_horz 2>/dev/null || true
  xdotool windowactivate --sync "$wid" 2>/dev/null || true
}

open_chrome() {
  resolve_chrome || return 1
  local pub
  pub="$(public_url || true)"

  # Refresh existing visible Chrome if present
  if command -v xdotool >/dev/null 2>&1; then
    local wid
    wid="$(xdotool search --onlyvisible --class 'google-chrome|Google-chrome|chromium' 2>/dev/null | head -1 || true)"
    if [[ -z "${wid:-}" ]]; then
      wid="$(xdotool search --onlyvisible --name 'ANVI|3947|Chrome' 2>/dev/null | tail -1 || true)"
    fi
    if [[ -n "${wid:-}" ]]; then
      focus_maximize "$wid"
      # Hard navigate tab 1 → localhost
      xdotool key --window "$wid" --clearmodifiers ctrl+1 2>/dev/null || true
      sleep 0.2
      xdotool key --window "$wid" --clearmodifiers ctrl+l 2>/dev/null || true
      sleep 0.15
      xdotool type --window "$wid" --delay 8 --clearmodifiers "$URL" 2>/dev/null || true
      xdotool key --window "$wid" --clearmodifiers Return 2>/dev/null || true
      sleep 0.9
      xdotool key --window "$wid" --clearmodifiers ctrl+shift+r 2>/dev/null || true
      # Ensure public tunnel on tab 2 if available
      if [[ -n "$pub" ]]; then
        sleep 0.4
        xdotool key --window "$wid" --clearmodifiers ctrl+t 2>/dev/null || true
        sleep 0.25
        xdotool key --window "$wid" --clearmodifiers ctrl+l 2>/dev/null || true
        sleep 0.1
        xdotool type --window "$wid" --delay 8 --clearmodifiers "$pub" 2>/dev/null || true
        xdotool key --window "$wid" --clearmodifiers Return 2>/dev/null || true
        sleep 0.6
        xdotool key --window "$wid" --clearmodifiers ctrl+1 2>/dev/null || true
      fi
      focus_maximize "$wid"
      echo "[live] refreshed Chrome → $URL${pub:+ + $pub}"
      return 0
    fi
  fi

  # Fresh maximized window (local + optional public tab)
  local args=(
    --no-sandbox
    --test-type
    --disable-dev-shm-usage
    --use-gl=angle
    --use-angle=swiftshader-webgl
    --password-store=basic
    --no-first-run
    --no-default-browser-check
    --disable-session-crashed-bubble
    --user-data-dir=/home/ubuntu/.config/google-chrome
    --class=google-chrome
    --window-size=1820,1100
    --window-position=50,50
    --start-maximized
    --new-window
    "$URL"
  )
  if [[ -n "$pub" ]]; then
    args+=("$pub")
  fi
  nohup "$CHROME_BIN" "${args[@]}" >>/tmp/chrome-anvi-live.log 2>&1 &
  sleep 2.5
  if command -v xdotool >/dev/null 2>&1; then
    local wid
    wid="$(xdotool search --onlyvisible --class google-chrome 2>/dev/null | head -1 || true)"
    focus_maximize "${wid:-}"
  fi
  wmctrl -a "ANVI" 2>/dev/null || wmctrl -a "127.0.0.1" 2>/dev/null || true
  echo "[live] opened Chrome → $URL${pub:+ + $pub}"
}

MODE="${1:-open}"
case "$MODE" in
  ensure|server)
    ensure_server
    ;;
  refresh|open|"")
    ensure_server
    open_chrome
    ;;
  restart)
    pkill -f "next-server|next start|next dev" 2>/dev/null || true
    fuser -k "${PORT}/tcp" 2>/dev/null || true
    sleep 1
    if [[ "${2:-}" == "--rebuild" ]]; then
      npm run build >>"$LOG" 2>&1
    fi
    ensure_server
    open_chrome
    ;;
  *)
    echo "Usage: $0 [open|ensure|refresh|restart [--rebuild]]"
    exit 1
    ;;
esac
