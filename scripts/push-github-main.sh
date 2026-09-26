#!/usr/bin/env bash
# Push current HEAD to GitHub main using a classic PAT from the environment.
# Usage:
#   export ANVI_GITHUB_TOKEN=ghp_xxxx   # repo scope; do not commit
#   bash scripts/push-github-main.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TOKEN="${ANVI_GITHUB_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  echo "Set ANVI_GITHUB_TOKEN (classic PAT with repo) then re-run."
  echo "Localhost testing does not need this — only www / GitHub main."
  exit 1
fi

BRANCH="$(git branch --show-current)"
SHA="$(git rev-parse --short HEAD)"
echo "[push-github] ${SHA} (${BRANCH}) → github main"

git push "https://x-access-token:${TOKEN}@github.com/dpanvigrand-sys/anvi-grand.git" "HEAD:main"
unset TOKEN
echo "[push-github] done — revoke the PAT at https://github.com/settings/tokens when finished"
