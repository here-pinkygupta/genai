#!/usr/bin/env bash
set -e

echo "===== RENDER BUILD START ====="

npm install

echo "Installing Chrome..."
npx puppeteer browsers install chrome

echo "===== RENDER BUILD FINISHED ====="