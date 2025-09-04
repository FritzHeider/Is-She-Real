#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "No .env found. Create one from .env.example"; exit 1
fi

fly deploy
