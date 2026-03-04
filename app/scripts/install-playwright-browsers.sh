#!/usr/bin/env bash
set -euo pipefail

if command -v pnpm >/dev/null 2>&1; then
  pnpm -C app exec playwright install chromium
  exit 0
fi

npx playwright install chromium
