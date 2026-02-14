#!/bin/bash

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

case "$FILE_PATH" in
  *.ts|*.tsx|*.astro|*.js|*.jsx)
    cd "$CLAUDE_PROJECT_DIR" || exit 1
    pnpm prettier --write "$FILE_PATH" > /dev/null 2>&1
    pnpm eslint --fix "$FILE_PATH" > /dev/null 2>&1
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
