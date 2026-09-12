#!/usr/bin/env bash
# Always-on ANVI GRAND live desktop helper.
# Ensures production server on :3947, then opens/refreshes Chrome maximized.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${ANVI_PORT:-3947}"
URL="http://127.0.0.1:${PORT}/"
export DISPLAY="${DISPLAY:-:1}"
LOG=/tmp/anvi-live.log
CHROME_PROFILE=/tmp/chrome-anvi-live-profile

cd "$ROOT"

site_ok() {
  local code html
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
  for i in $(seq 1 20); do
    sleep 0.5
    if site_ok; then
      echo "[live] server ready ($i)"
      return 0
    fi
  done
  echo "[live] FAILED to start — see $LOG" >&2
  return 1
}

open_chrome() {
  mkdir -p "$CHROME_PROFILE"
  # Prefer refreshing an existing window via keystroke; else open new.
  if pgrep -f "/opt/google/chrome/chrome" >/dev/null 2>&1; then
    wmctrl -a "ANVI" 2>/dev/null || wmctrl -a "127.0.0.1" 2>/dev/null || wmctrl -a "Chrome" 2>/dev/null || true
    # Navigate/hard-refresh if xdotool available
    if command -v xdotool >/dev/null 2>&1; then
      wid=$(xdotool search --name "ANVI|3947|Chrome" 2>/dev/null | tail -1 || true)
      if [[ -n "${wid:-}" ]]; then
        xdotool windowactivate "$wid" 2>/dev/null || true
        xdotool key --window "$wid" ctrl+l 2>/dev/null || true
        xdotool type --window "$wid" --clearmodifiers "$URL" 2>/dev/null || true
        xdotool key --window "$wid" Return 2>/dev/null || true
        sleep 0.8
        xdotool key --window "$wid" ctrl+shift+r 2>/dev/null || true
        echo "[live] refreshed Chrome → $URL"
        return 0
      fi
    fi
  fi
  # Fresh maximized window
  pkill -f "user-data-dir=${CHROME_PROFILE}" 2>/dev/null || true
  sleep 0.3
  nohup google-chrome \
    --user-data-dir="$CHROME_PROFILE" \
    --no-first-run \
    --no-default-browser-check \
    --disable-session-crashed-bubble \
    --start-maximized \
    --window-size=1680,1050 \
    --window-position=0,0 \
    "$URL" >>/tmp/chrome-anvi-live.log 2>&1 &
  sleep 2
  wmctrl -a "ANVI" 2>/dev/null || wmctrl -a "127.0.0.1" 2>/dev/null || true
  echo "[live] opened Chrome → $URL"
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
    # force rebuild if --rebuild passed as $2
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
