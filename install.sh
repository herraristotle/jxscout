#!/bin/sh
# jxscout installer: downloads the release archive for this platform into
# $JXSCOUT_INSTALL_DIR (default: ~/.local/bin) and verifies its checksum.
set -eu

REPO="${JXSCOUT_REPO:-herraristotle/jxscout}"
VERSION="${JXSCOUT_VERSION:-latest}"
DEST="${JXSCOUT_INSTALL_DIR:-$HOME/.local/bin}"

case "$(uname -s)" in
  Linux)  os=linux ;;
  Darwin) os=macOS ;;
  *) echo "unsupported OS: $(uname -s)" >&2; exit 1 ;;
esac

case "$(uname -m)" in
  x86_64|amd64)  arch=amd64 ;;
  aarch64|arm64) arch=arm64 ;;
  i386|i686)     arch=386 ;;
  *) echo "unsupported arch: $(uname -m)" >&2; exit 1 ;;
esac

if [ "$os" = linux ] && [ "$arch" != 386 ]; then
  plat="linux_$arch"
elif [ "$os" = linux ]; then
  plat="linux_386"
elif [ "$arch" = amd64 ]; then
  plat="macOS_amd64"
else
  plat="macOS_arm64"
fi

if [ "$VERSION" = latest ]; then
  base="${JXSCOUT_BASE_URL:-https://github.com/$REPO/releases/latest/download}"
else
  base="${JXSCOUT_BASE_URL:-https://github.com/$REPO/releases/download/v${VERSION#v}}"
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# Version is resolved from the redirect for the archive name; latest needs it.
if [ "$VERSION" = latest ]; then
  url="$(curl -fsSLI -o /dev/null -w '%{url_effective}' "$base" 2>/dev/null || true)"
  VERSION="$(printf '%s' "$url" | sed -n 's#.*/releases/tag/v##p')"
  [ -n "$VERSION" ] || { echo "could not resolve latest version" >&2; exit 1; }
fi

# Release names the macOS checksum file "mac", not "macOS".
case "$os" in
  macOS) checksum_os=mac ;;
  *)     checksum_os=$os ;;
esac

archive="jxscout_${VERSION}_${plat}.zip"
echo "downloading $archive"
curl -fsSL -o "$tmp/$archive" "$base/$archive"
curl -fsSL -o "$tmp/checksums.txt" "$base/jxscout-${checksum_os}-checksums.txt" || true

if [ -s "$tmp/checksums.txt" ]; then
  ( cd "$tmp" && grep " $archive\$" checksums.txt | shasum -a 256 -c - ) \
    || { echo "checksum verification failed" >&2; exit 1; }
else
  echo "warning: checksums not found, skipping verification" >&2
fi

unzip -q "$tmp/$archive" -d "$tmp"
mkdir -p "$DEST"
find "$tmp" -name jxscout -type f -exec cp {} "$DEST/jxscout" \;
chmod +x "$DEST/jxscout"

echo "installed $DEST/jxscout"
case ":$PATH:" in
  *":$DEST:"*) ;;
  *) echo "add to PATH: export PATH=\"$DEST:\$PATH\"" ;;
esac
