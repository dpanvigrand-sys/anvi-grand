#!/usr/bin/env bash
# ANVI GRAND — keep Next (:3947) + Cloudflare quick tunnel alive.
# Survives idle / Error 1033 by restarting dead processes and rewriting public URL.
#
# Usage:
#   bash scripts/ops-keep-alive.sh          # one-shot heal + print URL
#   bash scripts/ops-keep-alive.sh loop     # forever health loop (default 30s)
#   bash scripts/ops-keep-alive.sh status   # print status only
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${ANVI_PORT:-3947}"
PASS="${ANVI_OPS_PASSWORD:-anviops2026}"
STORE="${ANVI_STORE:-/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163}"
PUBLIC_URL_FILE="${ANVI_PUBLIC_URL_FILE:-$STORE/internal/public-url.txt}"
PUBLIC_URL_DOC="${ANVI_PUBLIC_URL_DOC:-$STORE/docs/public-url.md}"
PUBLIC_URL_FALLBACK="$ROOT/.anvi-public-url"
REPO_PUBLIC_DOC="$ROOT/docs/public-url.md"
LOG_DIR="${ANVI_KEEPALIVE_LOG_DIR:-/tmp}"
NEXT_LOG="${LOG_DIR}/anvi-keepalive-next.log"
TUNNEL_LOG="${LOG_DIR}/anvi-keepalive-tunnel.log"
PID_DIR="${LOG_DIR}/anvi-keepalive"
INTERVAL="${ANVI_KEEPALIVE_INTERVAL:-30}"
export DISPLAY="${DISPLAY:-:1}"

cd "$ROOT"
mkdir -p "$PID_DIR" "$(dirname "$PUBLIC_URL_FILE")" "$STORE/docs" "$STORE/media" 2>/dev/null || true

local_ok() {
  local code
  code=$(curl -s -o /tmp/anvi-ka-local.html -w "%{http_code}" --max-time 4 "http://127.0.0.1:${PORT}/" || echo 000)
  [[ "$code" == "200" ]] && grep -qi "ANVI" /tmp/anvi-ka-local.html
}

public_base_from_files() {
  local u=""
  for f in "$PUBLIC_URL_FILE" "$PUBLIC_URL_FALLBACK"; do
    if [[ -f "$f" ]]; then
      u="$(grep -m1 -E '^https://' "$f" 2>/dev/null | tr -d '[:space:]' || true)"
      [[ -n "$u" ]] && break
    fi
  done
  if [[ -z "$u" && -f "$PUBLIC_URL_DOC" ]]; then
    u="$(grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$PUBLIC_URL_DOC" 2>/dev/null | head -1 || true)"
  fi
  printf '%s' "${u%/}"
}

public_ok() {
  local base="$1"
  [[ -z "$base" ]] && return 1
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "${base}/" || echo 000)
  [[ "$code" == "200" ]]
}

ensure_cloudflared_bin() {
  if command -v cloudflared >/dev/null 2>&1; then
    return 0
  fi
  echo "[keep-alive] cloudflared missing — attempting install…"
  curl -fsSL -o /tmp/cloudflared.deb \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  sudo dpkg -i /tmp/cloudflared.deb >/tmp/cloudflared-install.log 2>&1 || sudo apt-get install -y -f >/tmp/cloudflared-install.log 2>&1 || true
  command -v cloudflared >/dev/null 2>&1
}

start_next() {
  echo "[keep-alive] starting Next on :${PORT}…"
  pkill -f "next-server|next start|next dev" 2>/dev/null || true
  fuser -k "${PORT}/tcp" 2>/dev/null || true
  sleep 1
  if [[ -f .next/BUILD_ID ]]; then
    nohup npx next start --hostname 0.0.0.0 --port "$PORT" >>"$NEXT_LOG" 2>&1 &
  else
    nohup npm run dev >>"$NEXT_LOG" 2>&1 &
  fi
  echo $! >"$PID_DIR/next.pid"
  for i in $(seq 1 60); do
    sleep 1
    if local_ok; then
      echo "[keep-alive] Next ready ($i)"
      return 0
    fi
  done
  echo "[keep-alive] FAIL: Next did not become ready — see $NEXT_LOG" >&2
  return 1
}

write_public_url() {
  local base="$1"
  [[ -z "$base" ]] && return 1
  mkdir -p "$(dirname "$PUBLIC_URL_FILE")"
  printf '%s\n' "$base" >"$PUBLIC_URL_FILE"
  printf '%s\n' "$base" >"$PUBLIC_URL_FALLBACK"
  local ts
  ts="$(date -u +%Y-%m-%dT%H:%MZ)"
  cat >"$PUBLIC_URL_DOC" <<EOF
# Public URL (Cloudflare quick tunnel)

Guest site + staff ops share one public base via Cloudflare quick tunnel → Next on \`:${PORT}\`.

**Current base (auto-healed ${ts}):**

${base}

> Quick tunnels recycle when \`cloudflared\` restarts. Keep-alive (\`scripts/ops-keep-alive.sh\`) restarts tunnel + Next if dead and rewrites this file.

## Language

Ops web UI is **English only** (no Telugu labels).

## Local

- http://127.0.0.1:${PORT}/
- http://127.0.0.1:${PORT}/ops?unlock=${PASS}

## Public ops + guest

Password: \`${PASS}\`

| Screen | URL |
|--------|-----|
| Guest home | ${base}/ |
| Ops hub (Quick edit: Photos + Menu) | ${base}/ops?unlock=${PASS} |
| Photos — Add / Edit | ${base}/ops/admin/photos?unlock=${PASS} |
| Menu (Food) — Add / Edit | ${base}/ops/admin/food?unlock=${PASS} |
| Accounts.1 | ${base}/ops/accounts?unlock=${PASS} |
| Bookings reports | ${base}/ops/admin/bookings?unlock=${PASS} |
| Venue bookings | ${base}/ops/admin/venue-bookings?unlock=${PASS} |
| Inward | ${base}/ops/inward?unlock=${PASS} |
| Outward | ${base}/ops/outward?unlock=${PASS} |

## Auto browser refresh

After every UI update: \`npm run live:refresh\` — opens unlocked \`/ops\` + guest \`/\`. See \`docs/auto-open-rule.md\`.

## Keep-alive

\`\`\`bash
bash scripts/ops-keep-alive.sh loop
\`\`\`
EOF
  # Mirror into repo docs when present
  if [[ -d "$ROOT/docs" ]]; then
    cp -f "$PUBLIC_URL_DOC" "$REPO_PUBLIC_DOC" 2>/dev/null || true
  fi
  echo "[keep-alive] public URL → $base"
}

start_tunnel() {
  ensure_cloudflared_bin || {
    echo "[keep-alive] WARN: no cloudflared; local-only" >&2
    return 1
  }
  echo "[keep-alive] starting cloudflared quick tunnel → :${PORT}"
  pkill -f "cloudflared tunnel" 2>/dev/null || true
  sleep 1
  : >"$TUNNEL_LOG"
  nohup cloudflared tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate >>"$TUNNEL_LOG" 2>&1 &
  echo $! >"$PID_DIR/tunnel.pid"
  local url=""
  for i in $(seq 1 40); do
    sleep 1
    url="$(grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | tail -1 || true)"
    if [[ -n "$url" ]]; then
      # Wait until public responds
      if public_ok "$url"; then
        write_public_url "$url"
        return 0
      fi
    fi
  done
  if [[ -n "${url:-}" ]]; then
    write_public_url "$url"
    echo "[keep-alive] WARN: tunnel URL written but not yet 200: $url" >&2
    return 0
  fi
  echo "[keep-alive] FAIL: no trycloudflare URL in $TUNNEL_LOG" >&2
  return 1
}

heal_once() {
  if ! local_ok; then
    start_next || return 1
  else
    echo "[keep-alive] Next OK on :${PORT}"
  fi

  local base
  base="$(public_base_from_files || true)"
  if [[ -n "$base" ]] && public_ok "$base"; then
    echo "[keep-alive] public OK $base"
    return 0
  fi
  echo "[keep-alive] public dead/missing — restarting tunnel"
  start_tunnel
}

print_status() {
  local base
  base="$(public_base_from_files || true)"
  echo "local:  $(local_ok && echo OK || echo DOWN)  http://127.0.0.1:${PORT}/"
  echo "ops:    http://127.0.0.1:${PORT}/ops?unlock=${PASS}"
  if [[ -n "$base" ]]; then
    echo "public: $(public_ok "$base" && echo OK || echo DOWN)  $base"
    echo "ops:    ${base}/ops?unlock=${PASS}"
  else
    echo "public: (none)"
  fi
}

MODE="${1:-once}"
case "$MODE" in
  once|"")
    heal_once
    print_status
    ;;
  loop|daemon)
    echo "[keep-alive] loop every ${INTERVAL}s — Ctrl+C to stop"
    while true; do
      heal_once || true
      print_status || true
      sleep "$INTERVAL"
    done
    ;;
  status)
    print_status
    ;;
  *)
    echo "Usage: $0 [once|loop|status]"
    exit 1
    ;;
esac
