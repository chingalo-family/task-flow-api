# Getting Started with Task Flow API

This guide will help you set up and run Task Flow API on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher, v18+ recommended)
- **npm** (v7.0.0 or higher)
- **Git** (for cloning the repository)

You can verify your installations:

```bash
node --version
npm --version
git --version
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/chingalo-family/task-flow-api.git
cd task-flow-api
```

### 2. Automated Setup (Recommended)

The easiest way to get started is using the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- ✅ Create `.env` file from `.env.sample`
- ✅ Install all npm dependencies
- ✅ Generate Prisma Client
- ✅ Run database migrations
- ✅ Set up the SQLite database

### 3. Manual Setup (Alternative)

If you prefer manual setup or the script doesn't work:

#### Step 3.1: Create Environment File

```bash
cp .env.sample .env
```

#### Step 3.2: Install Dependencies

```bash
npm install
```

#### Step 3.3: Generate Prisma Client

```bash
npx prisma generate
```

#### Step 3.4: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

## Configuration

### Basic Configuration

Open `.env` file and update the following variables:

```env
# Database Configuration
DB_NAME=taskflow.db
DATABASE_URL="file:./${DB_NAME}"

# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET="your-secret-key-here-change-in-production"
JWT_EXPIRATION=7d

# Password Reset Token (1 hour in milliseconds)
RESET_TOKEN_EXPIRATION=3600000

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

### Optional: Email Configuration

For password reset functionality, configure SMTP settings. See [Email Setup Guide](./email-setup.md) for detailed instructions.

```env
# Uncomment and configure for email functionality
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@taskflow.com
```

**Note**: Without email configuration, password reset tokens will be logged to the console (useful for development).

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The server will start at `http://localhost:3000`

You'll see output like:
```
🚀 Server running on port 3000
📚 Swagger docs available at http://localhost:3000/api-docs
```

### Production Mode

Build and run in production mode:

```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

For production deployment with PM2, see the [Deployment Guide](./deployment.md).

## Verifying Installation

### 1. Check API Health

Open your browser and navigate to:
```
http://localhost:3000/api-docs
```

You should see the Swagger API documentation interface.

### 2. Test API Endpoint

Try registering a new user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid-here",
    "username": "testuser",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### 3. Database Management

Open Prisma Studio to view and manage your database:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can:
- View all database tables
- Edit records
- Run queries
- Inspect relationships

## Next Steps

Now that you have Task Flow API running:

1. **Explore the API**: Visit `http://localhost:3000/api-docs` to see all available endpoints
2. **Read the API Reference**: Check [API Reference](./api-reference.md) for detailed endpoint documentation
3. **Understand the Architecture**: See [Architecture Guide](./architecture.md)
4. **Start Development**: Read the [Development Guide](./development.md)
5. **Configure for Production**: Follow the [Deployment Guide](./deployment.md)

## Common Issues

### Port Already in Use

If port 3000 is already in use, change the `PORT` in `.env`:

```env
PORT=3001
```

### Database Migration Errors

If migrations fail, try:

```bash
# Reset the database
npx prisma migrate reset

# Re-run migrations
npx prisma migrate dev --name init
```

### Prisma Client Not Generated

If you see "Cannot find module '@prisma/client'":

```bash
npx prisma generate
```

### Permission Denied on Scripts

If you can't run shell scripts:

```bash
chmod +x setup.sh
chmod +x deploy.sh
```

For more troubleshooting, see the [Troubleshooting Guide](./troubleshooting.md).

## Development Tools

### Recommended VS Code Extensions

- **Prisma** - Syntax highlighting for Prisma schema
- **ESLint** - JavaScript/TypeScript linting
- **REST Client** - Test API endpoints directly in VS Code
- **Thunder Client** - Alternative API testing tool

### Useful Commands

```bash
# View database schema
npx prisma studio

# Format Prisma schema
npx prisma format

# View migration status
npx prisma migrate status

# View server logs (in development)
npm run dev
```

## Learning Resources

- **Express.js**: https://expressjs.com/
- **Prisma**: https://www.prisma.io/docs/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Zod**: https://zod.dev/
- **JWT**: https://jwt.io/

## Getting Help

- **Documentation**: Browse other guides in the [docs](./README.md) folder
- **Issues**: Report bugs on [GitHub Issues](https://github.com/chingalo-family/task-flow-api/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/chingalo-family/task-flow-api/discussions)
