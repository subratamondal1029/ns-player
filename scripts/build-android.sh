#!/usr/bin/env bash
set -e

mkdir -p build/android

docker run --rm \
  -e EXPO_TOKEN \
  -e EAS_LOCAL_BUILD_ARTIFACTS_DIR=/app/build/android \
  -v "$PWD:/app" \
  -w /app \
  ns-player-builder:base \
  npm run build:android