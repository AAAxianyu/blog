#!/bin/bash
# ============================================
# x1anyu的小屋 Deployment Script
# Server: 115.190.136.177
# Domain: x1anyu.top
# ============================================
set -e

echo "🚀 Starting deployment..."

APP_DIR="/root/blog"
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

# Create logs directory if needed
mkdir -p logs

# Restart the application
echo "🔄 Restarting application..."
pm2 reload "$APP_NAME" || pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

echo "✅ Deployment complete! Visit https://x1anyu.top"
