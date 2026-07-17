#!/bin/bash
# ============================================
# ~/blog Deployment Script
# ============================================
set -e

echo "🚀 Starting deployment..."

# Configuration (modify these)
APP_DIR="/home/youruser/blog"
APP_NAME="blog"

cd "$APP_DIR"

# Pull latest changes
echo "📦 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building application..."
npm run build

# Restart the application
echo "🔄 Restarting application..."
pm2 reload "$APP_NAME" || pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "  - Check status: pm2 status"
echo "  - View logs: pm2 logs $APP_NAME"
echo "  - Test: curl http://localhost:3000"
