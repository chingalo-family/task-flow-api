#!/bin/bash

# Deployment script for Task Flow API using PM2

echo "🚀 Deploying Task Flow API with PM2..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env from .env.sample first"
    exit 1
fi

# Install dependencies
# Install dependencies
echo "📦 Installing dependencies..."
# Use npm ci for reliable builds from lockfile. ensure dev dependencies are installed for build step
npm ci --include=dev

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Build TypeScript
echo "🔨 Building application..."
npm run build

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# Reload application (Zero-Downtime) or Start if not running
echo "▶️  Reloading application with PM2..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

# Save PM2 process list
echo "💾 Saving PM2 process list..."
pm2 save

# Setup PM2 to start on system boot
echo "🔧 Configuring PM2 startup script..."
pm2 startup systemd -u $USER --hp $HOME

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: PM2 startup has been configured."
echo "   The API will automatically start on system reboot."
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status           - Check application status"
echo "  pm2 logs             - View logs"
echo "  pm2 restart all      - Restart application"
echo "  pm2 stop all         - Stop application"
echo "  pm2 monit            - Monitor application"
echo "  pm2 logs --lines 100 - View last 100 log lines"
