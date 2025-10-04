#!/usr/bin/env bash
set -e
echo "Installing dependencies..."
npm ci
echo "Building production bundle..."
npm run build
if ! command -v netlify &> /dev/null; then
  echo "netlify-cli not found — installing temporarily..."
  npm i -g netlify-cli
fi
echo "Deploying to Netlify (interactive if not linked)..."
npx netlify deploy --prod --dir=dist
echo "Deploy finished."
