#!/usr/bin/env bash

set -euo pipefail

usage() {
    cat <<EOF
Usage: $0 {patch|minor|major|pre|promote} [-b]

Bump the version in package.json, package-lock.json, and app.json.

Commands:
  patch              Increment the patch version
  minor              Increment the minor version
  major              Increment the major version
  pre                Increment the existing beta number (keeps versionCode)
  promote            Promote the current beta to stable (keeps versionCode)

Options:
  -b                 Add beta.1 to a patch, minor, or major bump
  -h, --help         Show this help message

Examples:
  $0 patch
  $0 minor -b
  $0 pre
  $0 promote
EOF
}

if [[ $# -eq 1 && ("$1" == "-h" || "$1" == "--help") ]]; then
    usage
    exit 0
fi

if [[ $# -lt 1 || $# -gt 2 ]]; then
    usage
    exit 1
fi

BUMP_TYPE="$1"
shift
BETA=false

if [[ $# -gt 0 ]]; then
    if [[ "$1" != "-b" ]]; then
        usage
        exit 1
    fi

    BETA=true
fi

case "$BUMP_TYPE" in
    patch|minor|major|pre|promote)
        ;;
    *)
        echo "Error: invalid bump type '$BUMP_TYPE'"
        usage
        exit 1
        ;;
esac

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PACKAGE_JSON="$ROOT_DIR/package.json"
PACKAGE_LOCK_JSON="$ROOT_DIR/package-lock.json"
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

# Validate Android versionCode
if ! [[ "$CURRENT_VERSION_CODE" =~ ^[0-9]+$ ]]; then
    echo "Error: invalid android.versionCode: $CURRENT_VERSION_CODE"
    exit 1
fi

# Validate and extract current version
IS_CURRENT_BETA=false
if [[ "$CURRENT_VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)-beta\.([0-9]+)$ ]]; then
    MAJOR="${BASH_REMATCH[1]}"
    MINOR="${BASH_REMATCH[2]}"
    PATCH="${BASH_REMATCH[3]}"
    BETA_VERSION="${BASH_REMATCH[4]}"
    IS_CURRENT_BETA=true
elif [[ "$CURRENT_VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    MAJOR="${BASH_REMATCH[1]}"
    MINOR="${BASH_REMATCH[2]}"
    PATCH="${BASH_REMATCH[3]}"
    BETA_VERSION=0
else
    echo "Error: invalid existing version: $CURRENT_VERSION"
    exit 1
fi

if [[ "$BUMP_TYPE" == "pre" ]]; then
    if [[ "$IS_CURRENT_BETA" != true ]]; then
        echo "Error: pre bump requires an existing beta version: $CURRENT_VERSION"
        exit 1
    fi
    if [[ "$BETA" == true ]]; then
        echo "Error: pre bump already targets a beta version; do not use -b"
        exit 1
    fi
    BETA_VERSION=$((BETA_VERSION + 1))
    NEXT_VERSION="$MAJOR.$MINOR.$PATCH-beta.$BETA_VERSION"
    NEXT_VERSION_CODE="$CURRENT_VERSION_CODE"
elif [[ "$BUMP_TYPE" == "promote" ]]; then
    if [[ "$IS_CURRENT_BETA" != true ]]; then
        echo "Error: promote requires an existing beta version: $CURRENT_VERSION"
        exit 1
    fi
    if [[ "$BETA" == true ]]; then
        echo "Error: promote command does not support -b"
        exit 1
    fi
    NEXT_VERSION="$MAJOR.$MINOR.$PATCH"
    NEXT_VERSION_CODE="$CURRENT_VERSION_CODE"
else
    # Handle patch, minor, major
    if [[ "$IS_CURRENT_BETA" == true && "$BETA" == false ]]; then
        echo "Error: current version is a beta ($CURRENT_VERSION). Use 'promote' to release to stable, or use '-b' to start a new beta."
        exit 1
    fi

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

    if [[ "$BETA" == true ]]; then
        NEXT_VERSION="$MAJOR.$MINOR.$PATCH-beta.1"
    else
        NEXT_VERSION="$MAJOR.$MINOR.$PATCH"
    fi

    NEXT_VERSION_CODE=$((CURRENT_VERSION_CODE + 1))
fi

# Update package.json
jq --arg version "$NEXT_VERSION" \
    '.version = $version' \
    "$PACKAGE_JSON" > "$PACKAGE_JSON.tmp"

mv "$PACKAGE_JSON.tmp" "$PACKAGE_JSON"

# Update package-lock.json if present
if [[ -f "$PACKAGE_LOCK_JSON" ]]; then
    jq --arg version "$NEXT_VERSION" \
        '.version = $version
         | .packages[""].version = $version' \
        "$PACKAGE_LOCK_JSON" > "$PACKAGE_LOCK_JSON.tmp"

    mv "$PACKAGE_LOCK_JSON.tmp" "$PACKAGE_LOCK_JSON"
fi

# Update app.json
jq \
    --arg version "$NEXT_VERSION" \
    --argjson versionCode "$NEXT_VERSION_CODE" \
    '.expo.version = $version
     | .expo.android.versionCode = $versionCode' \
    "$APP_JSON" > "$APP_JSON.tmp"

mv "$APP_JSON.tmp" "$APP_JSON"

# Git commit
FILES_TO_ADD=("$PACKAGE_JSON" "$APP_JSON")
if [[ -f "$PACKAGE_LOCK_JSON" ]]; then
    FILES_TO_ADD+=("$PACKAGE_LOCK_JSON")
fi

git add "${FILES_TO_ADD[@]}"
git commit -m "chore(version): $NEXT_VERSION"

echo
echo "Version bumped successfully:"
echo "  Version:     $CURRENT_VERSION -> $NEXT_VERSION"
echo "  VersionCode: $CURRENT_VERSION_CODE -> $NEXT_VERSION_CODE"
