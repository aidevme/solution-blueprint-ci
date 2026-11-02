#!/usr/bin/env bash
# Validate (and optionally render) a Mermaid file without an MCP server.
#
# Usage: validate_local.sh <diagram.mmd> [--backend auto|mmdc|kroki] [--out <file.svg|file.png>]
#
# Backends: local mmdc (@mermaid-js/mermaid-cli) first, then the Kroki HTTP API.
#   MMDC=<path>   use a specific mmdc binary (default: mmdc on PATH)
#   KROKI_URL=... use a self-hosted Kroki (default: https://kroki.io)
# Kroki is a public service: do not send confidential diagrams to it.
#
# Exit codes: 0 valid, 1 invalid (error text on stderr), 2 no backend available / usage error.

set -u

file=""
backend="auto"
out=""
while [ $# -gt 0 ]; do
  case "$1" in
    --backend) backend="${2:-}"; shift 2 ;;
    --out)     out="${2:-}"; shift 2 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *)         file="$1"; shift ;;
  esac
done

if [ -z "$file" ] || [ ! -f "$file" ]; then
  echo "usage: validate_local.sh <diagram.mmd> [--backend auto|mmdc|kroki] [--out file]" >&2
  exit 2
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

run_mmdc() {
  local bin="${MMDC:-mmdc}"
  command -v "$bin" >/dev/null 2>&1 || [ -x "$bin" ] || return 3
  local target="${out:-$tmpdir/out.svg}"
  local log="$tmpdir/mmdc.log"
  if "$bin" -q -i "$file" -o "$target" >"$log" 2>&1; then
    echo "valid (mmdc)${out:+ -> $out}"
    return 0
  fi
  # mmdc prints browser/launch failures differently from parse errors.
  if grep -qiE "Failed to launch|Could not find (Chrome|browser)|executablePath" "$log"; then
    echo "mmdc found but no browser to render with (set PUPPETEER_EXECUTABLE_PATH)" >&2
    return 3
  fi
  grep -vE "^\s*at " "$log" | sed '/^\s*$/d' | head -20 >&2
  return 1
}

run_kroki() {
  command -v curl >/dev/null 2>&1 || return 3
  local base="${KROKI_URL:-https://kroki.io}"
  local fmt="svg"
  case "$out" in *.png) fmt="png" ;; esac
  local target="${out:-$tmpdir/out.$fmt}"
  local code
  code="$(curl -s -m 60 -o "$target" -w '%{http_code}' -X POST \
    -H 'Content-Type: text/plain' --data-binary "@$file" "$base/mermaid/$fmt")" || return 3
  case "$code" in
    200) echo "valid (kroki)${out:+ -> $out}"; return 0 ;;
    400) cat "$target" >&2; echo >&2; [ -n "$out" ] && rm -f "$out"; return 1 ;;
    *)   echo "kroki returned HTTP $code" >&2; return 3 ;;
  esac
}

case "$backend" in
  mmdc)  run_mmdc;  rc=$? ;;
  kroki) run_kroki; rc=$? ;;
  auto)
    run_mmdc; rc=$?
    if [ "$rc" -eq 3 ]; then run_kroki; rc=$?; fi ;;
  *) echo "unknown backend: $backend" >&2; exit 2 ;;
esac

if [ "$rc" -eq 3 ]; then
  echo "no validation backend available (install @mermaid-js/mermaid-cli or allow access to Kroki)" >&2
  exit 2
fi
exit "$rc"
