#!/bin/sh
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is required to build the website. Install it and run ./start.sh again." >&2
    exit 1
fi
node scripts/build-site.mjs || exit 1

if command -v python3 >/dev/null 2>&1; then
    echo "Website: http://localhost:8000"
    echo "Press Ctrl+C to stop the server."
    exec python3 -m http.server 8000
fi

echo "Python 3 is required. Install it and run ./start.sh again." >&2
exit 1
