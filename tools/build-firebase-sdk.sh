#!/bin/sh
# Rebuilds firebase-sdk.js (the Firebase pieces the game uses, bundled so they work offline).
set -e
cd "$(dirname "$0")"
npm install --no-save firebase@^11 esbuild@0.24
npx esbuild firebase-entry.js --bundle --format=esm --minify --target=es2019 --legal-comments=none --outfile=../firebase-sdk.js
