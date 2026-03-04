#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PATTERN='console\.(log|warn|error|info|debug)\('

cd "$ROOT_DIR"

if command -v rg >/dev/null 2>&1; then
  if rg -n \
    "$PATTERN" \
    src/app/api \
    src/lib \
    --glob '!src/lib/analytics/**' \
    --glob '!src/lib/courses/**' \
    --glob '!src/lib/data/**' \
    --glob '!src/lib/devlab/**' \
    --glob '!src/lib/env.ts' \
    --glob '!src/lib/playground/**' \
    --glob '!src/lib/workbench/**' \
    --glob '!src/lib/workspace/**'
  then
    echo "Console guard failed: remove console.* from protected server paths." >&2
    exit 1
  fi
elif grep -RInE \
  "$PATTERN" \
  src/app/api \
  src/lib \
  --exclude-dir=analytics \
  --exclude-dir=courses \
  --exclude-dir=data \
  --exclude-dir=devlab \
  --exclude-dir=playground \
  --exclude-dir=workbench \
  --exclude-dir=workspace \
  --exclude='env.ts'
then
  echo "Console guard failed: remove console.* from protected server paths." >&2
  exit 1
fi

echo "Console guard passed."
