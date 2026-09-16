#!/usr/bin/env bash
# ANVI GRAND — keep Next (:3947) + Cloudflare quick tunnel alive.
# Survives idle / Error 1033 by restarting *dead* processes and rewriting public URL.
#
# IMPORTANT: Do NOT thrash-restart tunnels on curl/DNS false-negatives from the VM.
# A tunnel is "healthy" if cloudflared is running AND the log shows a Registered
# connection. External 200 checks are best-effort (DNS for *.trycloudflare.com can lag).
#
# Usage:
#   bash scripts/ops-keep-alive.sh          # one-shot heal + print URL
#   bash scripts/ops-keep-alive.sh loop     # forever health loop (default 60s)
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
INTERVAL="${ANVI_KEEPALIVE_INTERVAL:-60}"
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

public_http_ok() {
  local base="$1"
  [[ -z "$base" ]] && return 1
  local host code
  host="$(printf '%s' "$base" | sed -E 's|^https?://||; s|/.*||')"
  # VM default DNS often cannot resolve brand-new *.trycloudflare.com — query 1.1.1.1.
  local ip=""
  ip="$(dig @1.1.1.1 +short "$host" A 2>/dev/null | head -1 || true)"
  if [[ -n "$ip" ]]; then
    code=$(curl -4 -s -o /dev/null -w "%{http_code}" --max-time 12 \
      --resolve "${host}:443:${ip}" "${base}/" 2>/dev/null || echo 000)
    [[ "$code" == "200" ]] && return 0
  fi
  code=$(curl -4 -s -o /dev/null -w "%{http_code}" --max-time 10 "${base}/" 2>/dev/null || echo 000)
  [[ "$code" == "200" ]] && return 0
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${base}/" 2>/dev/null || echo 000)
  [[ "$code" == "200" ]]
}

# Ensure Chrome / system resolver can resolve trycloudflare hostnames on this VM.
ensure_dns() {
  if ! grep -q 'nameserver 1.1.1.1' /etc/resolv.conf 2>/dev/null; then
    echo "[keep-alive] adding 1.1.1.1 to /etc/resolv.conf (trycloudflare DNS lag fix)"
    sudo bash -c 'printf "nameserver 1.1.1.1\nnameserver 8.8.8.8\n" > /etc/resolv.conf.anvi && cat /etc/resolv.conf >> /etc/resolv.conf.anvi && mv /etc/resolv.conf.anvi /etc/resolv.conf' 2>/dev/null || true
  fi
}

tunnel_process_ok() {
  pgrep -f 'cloudflared tunnel --url' >/dev/null 2>&1
}

tunnel_registered_ok() {
  [[ -f "$TUNNEL_LOG" ]] || return 1
  grep -q 'Registered tunnel connection' "$TUNNEL_LOG" 2>/dev/null
}

# Tunnel is considered alive if process is up AND registered — even if local DNS
# cannot resolve the trycloudflare hostname yet (common false-negative).
tunnel_ok() {
  tunnel_process_ok && tunnel_registered_ok
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

> **Hard limit:** Quick tunnels die when this cloud VM is recycled or the agent is archived. Keep-alive in **tmux** (\`npm run ops:persist\`) survives agent *turn end* on the same VM — not VM death. Hostname rotates whenever \`cloudflared\` truly restarts. Open these URLs on **your laptop browser** while a warm agent is RUNNING.

> Keep-alive only restarts when the tunnel **process** is dead — not on transient DNS/curl failures.

## Language

Ops web UI is **English only** (no Telugu labels).

## Local (Try Live desktop — only visible if you open Try Live)

- http://localhost:${PORT}/
- http://localhost:${PORT}/ops?unlock=${PASS}
- http://localhost:${PORT}/ops/admin?unlock=${PASS}

## Public — open on YOUR laptop (primary)

Password: \`${PASS}\`

| Screen | URL |
|--------|-----|
| 1. Website (guest) | ${base}/ |
| 2. Ops hub | ${base}/ops?unlock=${PASS} |
| 3. Admin.1 | ${base}/ops/admin?unlock=${PASS} |
| Reception | ${base}/ops/reception?unlock=${PASS} |
| Photos — Add / Edit | ${base}/ops/admin/photos?unlock=${PASS} |
| Menu (Food) — Add / Edit | ${base}/ops/admin/food?unlock=${PASS} |
| Bookings reports | ${base}/ops/admin/bookings?unlock=${PASS} |
| Venue bookings | ${base}/ops/admin/venue-bookings?unlock=${PASS} |

## Unlock note

\`?unlock=${PASS}\` writes \`localStorage\` on **that hostname only**. A new \`*.trycloudflare.com\` name is a new origin — paste the unlock query again after hostname rotation.

## Auto browser refresh

After every UI update: \`npm run live:refresh\` — opens unlocked \`/ops\` + guest \`/\` on Try Live. See \`docs/auto-open-rule.md\`.

## Keep-alive (durable on this VM)

\`\`\`bash
npm run ops:persist          # tmux-backed; survives turn end
# or: bash scripts/ops-persist.sh ensure
bash scripts/ops-keep-alive.sh loop   # foreground loop (dies with shell)
\`\`\`

See \`docs/open-failure-deep-check.md\` for root causes.
EOF
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
  for i in $(seq 1 45); do
    sleep 1
    url="$(grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | tail -1 || true)"
    if [[ -n "$url" ]] && tunnel_registered_ok; then
      write_public_url "$url"
      # Best-effort wait for HTTP 200 (may fail on VM DNS — do not treat as fatal)
      for j in $(seq 1 15); do
        if public_http_ok "$url"; then
          echo "[keep-alive] public HTTP 200 confirmed"
          return 0
        fi
        sleep 2
      done
      echo "[keep-alive] tunnel registered (HTTP check pending/DNS lag) — keeping URL $url"
      return 0
    fi
  done
  if [[ -n "${url:-}" ]]; then
    write_public_url "$url"
    echo "[keep-alive] WARN: URL written, registration slow — see $TUNNEL_LOG" >&2
    return 0
  fi
  echo "[keep-alive] FAIL: no trycloudflare URL in $TUNNEL_LOG" >&2
  return 1
}

heal_once() {
  ensure_dns || true
  if ! local_ok; then
    start_next || return 1
  else
    echo "[keep-alive] Next OK on :${PORT}"
  fi

  local base
  base="$(public_base_from_files || true)"

  # Prefer process+registration health over curl (avoids thrashing on DNS lag).
  if tunnel_ok; then
    if [[ -z "$base" ]]; then
      base="$(grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | tail -1 || true)"
      [[ -n "$base" ]] && write_public_url "$base"
    fi
    if public_http_ok "${base:-}"; then
      echo "[keep-alive] public OK $base"
    else
      echo "[keep-alive] tunnel process OK (curl/DNS not yet 200) $base"
    fi
    return 0
  fi

  echo "[keep-alive] tunnel process dead/unregistered — restarting"
  start_tunnel
}

print_status() {
  local base
  base="$(public_base_from_files || true)"
  echo "local:  $(local_ok && echo OK || echo DOWN)  http://127.0.0.1:${PORT}/"
  echo "ops:    http://localhost:${PORT}/ops?unlock=${PASS}"
  echo "tunnel: $(tunnel_ok && echo OK || echo DOWN)  (process+registered)"
  if [[ -n "$base" ]]; then
    echo "public: $(public_http_ok "$base" && echo HTTP200 || echo pending/DNS)  $base"
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
    echo "[keep-alive] loop every ${INTERVAL}s — only restarts dead processes (no DNS thrash)"
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
