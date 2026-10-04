#!/usr/bin/env bash
set -e
source "$(dirname "$0")/config.sh"

echo "Copying web assets to server..."
mkdir -p server/internal/embed/assets
cp -r build/web/* server/internal/embed/assets

echo "Building go server..."
mkdir -p build/server

cd server
GOOS=linux GOARCH=amd64 go build -o ../build/server/app-linux-amd64 ./cmd/ns-player
cd ..
echo "Go server built successfully."

echo "Creating AppImage for Linux..."
mkdir -p build/linux/AppDir/usr/bin

cp build/server/app-linux-amd64 build/linux/AppDir/usr/bin/ns-player
cp assets/linux/icon.png build/linux/AppDir/ns-player.png

cp scripts/assets/linux/ns-player.desktop build/linux/AppDir/ns-player.desktop
cp scripts/assets/linux/AppRun build/linux/AppDir/AppRun

echo "Compiling AppImage..."
docker run --rm \
  -v "$PWD:/app" \
  -w /app \
  -e ARCH=x86_64 \
  "$BUILDER_IMAGE" \
  appimagetool build/linux/AppDir build/linux/NS-Player.AppImage

echo "AppImage created successfully."