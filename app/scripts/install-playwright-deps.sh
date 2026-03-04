#!/usr/bin/env bash
set -euo pipefail

if [[ "${VERCEL:-}" == "1" ]]; then
  echo "Skipping Playwright dependency installation on Vercel."
  exit 0
fi

if ! command -v apt-get >/dev/null 2>&1; then
  echo "apt-get is not available on this system. Install Chromium dependencies manually."
  exit 0
fi

if [[ -r /etc/os-release ]]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  if [[ "${ID:-}" != "ubuntu" && "${ID:-}" != "debian" ]]; then
    echo "Detected ${PRETTY_NAME:-unknown distro}. This helper is intended for Ubuntu/Debian."
    echo "Skipping apt install. Install Chromium dependencies manually for your distro."
    exit 0
  fi
fi

install_if_available() {
  local package="$1"

  if apt-cache show "$package" >/dev/null 2>&1; then
    sudo apt-get install -y "$package"
    return 0
  fi

  return 1
}

sudo apt-get update

base_packages=(
  libatk-1.0-0
  libatk-bridge2.0-0
  libcups2
  libdrm2
  libxkbcommon0
  libxcomposite1
  libxdamage1
  libxfixes3
  libxrandr2
  libgbm1
  libpangocairo-1.0-0
  libpango-1.0-0
  libnss3
  libnspr4
  libx11-xcb1
  libxshmfence1
  ca-certificates
  fonts-liberation
)

sudo apt-get install -y "${base_packages[@]}"

if ! install_if_available "libasound2t64"; then
  install_if_available "libasound2"
fi

if ! install_if_available "libgtk-3-0"; then
  install_if_available "libgtk-4-1" || true
fi

echo "Playwright Chromium system dependencies installed."
echo "Next: run 'pnpm -C app exec playwright install chromium' (or 'pnpm -C app e2e:install')."
