#!/usr/bin/env bash
set -e

mkdir -p build/web

docker run --rm \
    -v "$PWD:/app" \
    -w /app \
    ns-player-builder:base \
    npm run build:web

echo "Web build completed"