#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^[[:space:]]*#' .env | grep -v '^[[:space:]]*$' | xargs)
else
  echo "No .env found. Create one from .env.example"; exit 1
fi

if ! command -v fly >/dev/null 2>&1; then
  echo "flyctl not found. Install: https://fly.io/docs/hands-on/install-flyctl/"; exit 1
fi

if ! fly status >/dev/null 2>&1; then
  fly launch --no-deploy
fi

set_secret () { [ -n "${!1:-}" ] && fly secrets set "$1=${!1}"; }

# Core
for key in IG_ACCESS_TOKEN FB_ACCESS_TOKEN TT_ACCESS_TOKEN TIMEOUT_S CORS_ORIGINS API_KEY WHOIS_API_KEY ABUSEIPDB_API_KEY GH_TOKEN; do
  set_secret "$key"
done

fly deploy
