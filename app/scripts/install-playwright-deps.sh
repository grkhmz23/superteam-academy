#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APT_ARGS=()
APT_FALLBACK_DIR=""

cleanup() {
  if [[ -n "${APT_FALLBACK_DIR}" && -d "${APT_FALLBACK_DIR}" ]]; then
    rm -rf "${APT_FALLBACK_DIR}"
  fi
}

trap cleanup EXIT

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

  if apt-cache "${APT_ARGS[@]}" show "$package" >/dev/null 2>&1; then
    sudo apt-get "${APT_ARGS[@]}" install -y "$package"
    return 0
  fi

  return 1
}

install_first_available() {
  local package

  for package in "$@"; do
    if install_if_available "$package"; then
      return 0
    fi
  done

  return 1
}

install_required_group() {
  if install_first_available "$@"; then
    return 0
  fi

  echo "Unable to install any supported package variant from: $*"
  exit 1
}

if ! sudo apt-get update; then
  echo "apt-get update failed, retrying with official distro sources only."

  APT_FALLBACK_DIR="$(mktemp -d)"
  node "${SCRIPT_DIR}/playwright-apt-sources.mjs" --output-dir "${APT_FALLBACK_DIR}"

  APT_ARGS=(
    "-o"
    "Dir::Etc::sourcelist=${APT_FALLBACK_DIR}/sources.list"
    "-o"
    "Dir::Etc::sourceparts=${APT_FALLBACK_DIR}/sources.list.d"
  )

  sudo apt-get "${APT_ARGS[@]}" update
fi

install_required_group "libatk1.0-0t64" "libatk1.0-0"
install_required_group "libatk-bridge2.0-0t64" "libatk-bridge2.0-0"
install_required_group "libcups2t64" "libcups2"
install_required_group "libdrm2"
install_required_group "libxkbcommon0"
install_required_group "libxcomposite1"
install_required_group "libxdamage1"
install_required_group "libxfixes3"
install_required_group "libxrandr2"
install_required_group "libgbm1"
install_required_group "libpangocairo-1.0-0"
install_required_group "libpango-1.0-0"
install_required_group "libnss3"
install_required_group "libnspr4"
install_required_group "libx11-xcb1"
install_required_group "libxshmfence1"
install_required_group "ca-certificates"
install_required_group "fonts-liberation"

install_first_available "libasound2t64" "libasound2"

if ! install_first_available "libgtk-3-0t64" "libgtk-3-0"; then
  install_if_available "libgtk-4-1" || true
fi

echo "Playwright Chromium system dependencies installed."
echo "Next: run 'pnpm -C app exec playwright install chromium' (or 'pnpm -C app e2e:install')."
