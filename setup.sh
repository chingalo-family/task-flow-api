#!/bin/bash

# Setup script for Task Flow API

echo "Setting up Task Flow API..."

# Check if .env exists
if [ -f .env ]; then
    echo "✓ .env file already exists"
else
    echo "Creating .env from .env.sample..."
    cp .env.sample .env
    echo "✓ .env file created"
    echo "⚠️  Please update .env with your configuration"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate dev --name init

echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "API will be available at: http://localhost:3000"
echo "Swagger docs at: http://localhost:3000/api-docs"
