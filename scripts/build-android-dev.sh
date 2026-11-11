#!/usr/bin/env bash
set -e

source "$(dirname "$0")/config.sh"

mkdir -p build/android

docker run --rm \
  -e EXPO_TOKEN \
  -e EAS_LOCAL_BUILD_ARTIFACTS_DIR=/app/build/android \
  -v "$PWD:/app" \
  -w /app \
  "$BUILDER_IMAGE" \
  sh -c "npm ci && eas build --platform android --profile development --local"

mv build/android/build-*apk build/android/ns-player-dev.apk