#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
    echo "Usage: $0 <base-sha> [merge-sha] [head-ref]" >&2
    exit 1
fi

BASE_SHA="$1"
MERGE_SHA="${2:-HEAD}"
HEAD_REF="${3:-}"

# Ensure base and merge commits are available locally
if ! git cat-file -e "$BASE_SHA^{commit}" 2>/dev/null; then
    git fetch origin "$BASE_SHA" --depth=1 2>/dev/null || true
fi

if ! git cat-file -e "$MERGE_SHA^{commit}" 2>/dev/null; then
    git fetch origin "$MERGE_SHA" --depth=1 2>/dev/null || true
fi

files=$(git diff --name-only "$BASE_SHA" "$MERGE_SHA")

if [[ -n "$files" ]] && ! grep -qvE '\.md$' <<< "$files"; then
    docs_only=true
else
    docs_only=false
fi

if [[ "$docs_only" == "false" && "$HEAD_REF" == "docs" ]]; then
    echo "::error::Non-documentation changes detected in documentation-only branch '$HEAD_REF'" >&2
    exit 1
fi

echo "$docs_only"