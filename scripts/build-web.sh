#!/usr/bin/env bash
set -e

source "$(dirname "$0")/config.sh"

mkdir -p build/web

docker run --rm \
    -v "$PWD:/app" \
    -w /app \
    "$BUILDER_IMAGE" \
    npm run build:web

echo "Web build completed"