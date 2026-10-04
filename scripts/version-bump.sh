#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 {patch|minor|major}"
    exit 1
fi

BUMP_TYPE="$1"

case "$BUMP_TYPE" in
    patch|minor|major)
        ;;
    *)
        echo "Error: invalid bump type '$BUMP_TYPE'"
        echo "Usage: $0 {patch|minor|major}"
        exit 1
        ;;
esac

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PACKAGE_JSON="$ROOT_DIR/package.json"
APP_JSON="$ROOT_DIR/app.json"

CURRENT_VERSION="$(jq -r '.version' "$PACKAGE_JSON")"
APP_VERSION="$(jq -r '.expo.version' "$APP_JSON")"
CURRENT_VERSION_CODE="$(jq -r '.expo.android.versionCode' "$APP_JSON")"

# Validate package.json and app.json versions match
if [[ "$CURRENT_VERSION" != "$APP_VERSION" ]]; then
    echo "Error: package.json and app.json versions do not match."
    echo "package.json: $CURRENT_VERSION"
    echo "app.json:     $APP_VERSION"
    exit 1
fi

# Validate and extract current version
if [[ "$CURRENT_VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    MAJOR="${BASH_REMATCH[1]}"
    MINOR="${BASH_REMATCH[2]}"
    PATCH="${BASH_REMATCH[3]}"
else
    echo "Error: invalid existing version: $CURRENT_VERSION"
    exit 1
fi

# Validate Android versionCode
if ! [[ "$CURRENT_VERSION_CODE" =~ ^[0-9]+$ ]]; then
    echo "Error: invalid android.versionCode: $CURRENT_VERSION_CODE"
    exit 1
fi

# Calculate next version
case "$BUMP_TYPE" in
    patch)
        PATCH=$((PATCH + 1))
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
esac

NEXT_VERSION="$MAJOR.$MINOR.$PATCH"
NEXT_VERSION_CODE=$((CURRENT_VERSION_CODE + 1))

# Update package.json
jq --arg version "$NEXT_VERSION" \
    '.version = $version' \
    "$PACKAGE_JSON" > "$PACKAGE_JSON.tmp"

mv "$PACKAGE_JSON.tmp" "$PACKAGE_JSON"

# Update app.json
jq \
    --arg version "$NEXT_VERSION" \
    --argjson versionCode "$NEXT_VERSION_CODE" \
    '.expo.version = $version
     | .expo.android.versionCode = $versionCode' \
    "$APP_JSON" > "$APP_JSON.tmp"

mv "$APP_JSON.tmp" "$APP_JSON"

# git tag
git add "$PACKAGE_JSON" "$APP_JSON"
git commit -m "chore(version): $NEXT_VERSION"
# git tag will trigger after build success in github ci

echo
echo "Version bumped successfully:"
echo "  Version:     $CURRENT_VERSION -> $NEXT_VERSION"
echo "  VersionCode: $CURRENT_VERSION_CODE -> $NEXT_VERSION_CODE"

