#!/usr/bin/env bash
set -e

mkdir -p build/web

docker run --rm \
    -v "$PWD:/app" \
    -w /app \
    ns-player-builder:base \
    npm run build:web

echo "Copying web assets to server..."
mkdir -p server/internal/embed/assets
cp -r build/web/* server/internal/embed/assets

echo "Building go server..."
mkdir -p build/server

cd server
GOOS=linux GOARCH=amd64 go build -o ../build/server/app-linux-amd64 ./cmd/ns-player
echo "Go server built successfully."