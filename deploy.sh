#!/usr/bin/env bash
set -euo pipefail

npm run check
git push origin main

echo "Pushed main. Follow deployment with: gh run watch --repo AAAxianyu/blog"
