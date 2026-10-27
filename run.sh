#!/usr/bin/env bash
# AI Marketplace - Bash / WSL / Linux / macOS Launcher
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1
node "$SCRIPT_DIR/scripts/run-all.mjs" "$@"
