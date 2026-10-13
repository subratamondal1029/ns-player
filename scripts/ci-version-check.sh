#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <target-branch>" >&2
    exit 1
fi

TARGET_BRANCH="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_JSON="$ROOT_DIR/package.json"
APP_JSON="$ROOT_DIR/app.json"

LOCAL_VERSION="$(jq -r '.version' "$PACKAGE_JSON")"
APP_VERSION="$(jq -r '.expo.version' "$APP_JSON")"
APP_VERSION_CODE="$(jq -r '.expo.android.versionCode' "$APP_JSON")"

if [[ "$LOCAL_VERSION" != "$APP_VERSION" ]]; then
    echo "::error::package.json ($LOCAL_VERSION) and app.json ($APP_VERSION) versions do not match" >&2
    exit 1
fi

if ! [[ "$APP_VERSION_CODE" =~ ^[0-9]+$ ]]; then
    echo "::error::Invalid android.versionCode in app.json: $APP_VERSION_CODE" >&2
    exit 1
fi

if ! [[ "$LOCAL_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$ ]]; then
    echo "::error::Invalid SemVer: $LOCAL_VERSION" >&2
    exit 1
fi

semver_greater() {
    local first="$1"
    local second="$2"
    local first_major first_minor first_patch first_beta
    local second_major second_minor second_patch second_beta

    if [[ "$first" == "$second" ]]; then
        return 1
    fi

    if [[ "$first" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-beta\.([0-9]+))?$ ]]; then
        first_major="${BASH_REMATCH[1]}"
        first_minor="${BASH_REMATCH[2]}"
        first_patch="${BASH_REMATCH[3]}"
        first_beta="${BASH_REMATCH[5]:-}"
    else
        return 1
    fi

    if [[ "$second" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-beta\.([0-9]+))?$ ]]; then
        second_major="${BASH_REMATCH[1]}"
        second_minor="${BASH_REMATCH[2]}"
        second_patch="${BASH_REMATCH[3]}"
        second_beta="${BASH_REMATCH[5]:-}"
    else
        return 1
    fi

    if ((10#$first_major != 10#$second_major)); then
        ((10#$first_major > 10#$second_major))
        return
    fi
    if ((10#$first_minor != 10#$second_minor)); then
        ((10#$first_minor > 10#$second_minor))
        return
    fi
    if ((10#$first_patch != 10#$second_patch)); then
        ((10#$first_patch > 10#$second_patch))
        return
    fi

    if [[ -z "$first_beta" && -n "$second_beta" ]]; then
        return 0
    fi
    if [[ -n "$first_beta" && -z "$second_beta" ]]; then
        return 1
    fi
    if [[ -n "$first_beta" && -n "$second_beta" ]]; then
        ((10#$first_beta > 10#$second_beta))
        return
    fi

    return 1
}

case "$TARGET_BRANCH" in
    main)
        if [[ "$LOCAL_VERSION" == *-beta.* ]]; then
            echo "::error::Beta version $LOCAL_VERSION is not allowed on main" >&2
            exit 1
        fi
        ;;
    dev/*)
        if [[ "$LOCAL_VERSION" != *-beta.* ]]; then
            echo "::error::Version $LOCAL_VERSION must be a beta version on $TARGET_BRANCH" >&2
            exit 1
        fi
        ;;
    *)
        echo "::error::Unsupported target branch: $TARGET_BRANCH" >&2
        exit 1
        ;;
esac

REMOTE_VERSION=""
while IFS= read -r tag_version; do
    if ! [[ "$tag_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$ ]]; then
        continue
    fi
    if [[ -z "$REMOTE_VERSION" ]] || semver_greater "$tag_version" "$REMOTE_VERSION"; then
        REMOTE_VERSION="$tag_version"
    fi
done < <(git ls-remote --tags --refs origin 'v*' | sed 's|.*refs/tags/v||')

echo "local=$LOCAL_VERSION remote=${REMOTE_VERSION:-none}" >&2

if [[ -n "$REMOTE_VERSION" ]]; then
    if [[ "$LOCAL_VERSION" == "$REMOTE_VERSION" ]]; then
        echo "::error::Version $LOCAL_VERSION is already released" >&2
        exit 1
    fi

    if ! semver_greater "$LOCAL_VERSION" "$REMOTE_VERSION"; then
        echo "::error::Local $LOCAL_VERSION is lower than remote $REMOTE_VERSION" >&2
        exit 1
    fi
fi

echo "$LOCAL_VERSION"
