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
echo "📦 Installing dependencies..."
npm install --production=false

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

# Stop existing instance if running
echo "🛑 Stopping existing instance..."
pm2 stop task-flow-api 2>/dev/null || true
pm2 delete task-flow-api 2>/dev/null || true

# Start application with PM2
echo "▶️  Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot (optional)
read -p "Do you want PM2 to start on system boot? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pm2 startup
    echo "✅ PM2 startup configured. Run the command shown above with sudo."
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status           - Check application status"
echo "  pm2 logs             - View logs"
echo "  pm2 restart all      - Restart application"
echo "  pm2 stop all         - Stop application"
echo "  pm2 monit            - Monitor application"
echo "  pm2 logs --lines 100 - View last 100 log lines"
