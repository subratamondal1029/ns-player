#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd $ROOT_DIR
kitty --session "$ROOT_DIR/scripts/assets/dev/kitty.conf"