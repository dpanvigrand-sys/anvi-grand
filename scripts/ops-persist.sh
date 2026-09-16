#!/usr/bin/env bash
# ANVI GRAND — durable Next + tunnel + keep-alive via tmux.
# Survives agent shell/turn end within the SAME cloud VM.
# Does NOT survive VM recycle / agent archive (hard Cloudflare quick-tunnel limit).
#
# Usage:
#   bash scripts/ops-persist.sh ensure   # start/reuse tmux sessions
#   bash scripts/ops-persist.sh status
#   bash scripts/ops-persist.sh stop
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${ANVI_PORT:-3947}"
TMUX_CONF="${TMUX_CONF:-/exec-daemon/tmux.portal.conf}"
SESSION_KA="anvi-keep-alive"
SESSION_NOTE="anvi-persist-note"
export DISPLAY="${DISPLAY:-:1}"

tmux_bin() {
  # Cloud agent portal always uses this conf; fallback only if missing.
  if [[ -f /exec-daemon/tmux.portal.conf ]]; then
    tmux -f /exec-daemon/tmux.portal.conf "$@"
  elif [[ -f "${TMUX_CONF:-}" ]]; then
    tmux -f "$TMUX_CONF" "$@"
  else
    tmux "$@"
  fi
}

ensure_session() {
  local name="$1"
  shift
  if tmux_bin has-session -t "=$name" 2>/dev/null; then
    echo "[persist] session $name already running"
    return 0
  fi
  echo "[persist] starting session $name"
  # Start a login shell then send keys — more reliable on portal tmux
  tmux_bin new-session -d -s "$name" -c "$ROOT" -- "${SHELL:-bash}" -l
  local cmd="$*"
  tmux_bin send-keys -t "$name:0.0" "$cmd" C-m
}

ensure() {
  cd "$ROOT"
  # One-shot heal first so URL is written before loop
  bash "$ROOT/scripts/ops-keep-alive.sh" once || true
  # Forever loop in detached tmux — survives agent turn end on this VM
  ensure_session "$SESSION_KA" bash -lc \
    "cd '$ROOT' && while true; do bash scripts/ops-keep-alive.sh once || true; sleep \${ANVI_KEEPALIVE_INTERVAL:-45}; done"
  # Marker file for docs / status
  mkdir -p /tmp/anvi-keepalive
  date -u +%Y-%m-%dT%H:%MZ > /tmp/anvi-keepalive/persist-started.txt
  echo "tmux:$SESSION_KA" > /tmp/anvi-keepalive/persist-mode.txt
  bash "$ROOT/scripts/ops-keep-alive.sh" status || true
  echo "[persist] keep-alive is tmux-backed (survives turn end; dies if this VM is recycled)"
}

status() {
  echo "=== tmux sessions ==="
  tmux_bin ls 2>/dev/null || echo "(none)"
  echo "=== keep-alive status ==="
  bash "$ROOT/scripts/ops-keep-alive.sh" status || true
  if [[ -f /tmp/anvi-keepalive/persist-started.txt ]]; then
    echo "persist started: $(cat /tmp/anvi-keepalive/persist-started.txt)"
  fi
}

stop() {
  tmux_bin kill-session -t "=$SESSION_KA" 2>/dev/null || true
  pkill -f 'cloudflared tunnel --url' 2>/dev/null || true
  pkill -f 'next-server|next start|next dev' 2>/dev/null || true
  echo "[persist] stopped"
}

case "${1:-ensure}" in
  ensure|start) ensure ;;
  status) status ;;
  stop) stop ;;
  *) echo "Usage: $0 [ensure|status|stop]"; exit 1 ;;
esac
