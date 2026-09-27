#!/usr/bin/env sh
# Run ./start.sh from a terminal to start the site.
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install it from https://nodejs.org and run this again."
  exit 1
fi
exec node scripts/start.mjs "$@"
