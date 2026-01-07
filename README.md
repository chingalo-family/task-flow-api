# Task Flow API

A robust RESTful API for task management built with Node.js, Express, TypeScript, and Prisma.

## Features

- 🔐 **Authentication**: JWT-based auth with password reset
- ✅ **Task Management**: Full CRUD with subtasks, tags, and attachments
- 👥 **Team Collaboration**: Team management with roles
- 🔔 **Notifications**: Real-time notification system
- 📚 **API Documentation**: Interactive Swagger/OpenAPI docs
- 💾 **Database**: SQLite with Prisma ORM

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd task-flow-api

# Run automated setup
./setup.sh
```

The setup script will:
- Create `.env` from `.env.sample`
- Install dependencies
- Generate Prisma Client
- Run database migrations

### 2. Configure Environment

Edit `.env` to customize:

```bash
# Database name (change if needed)
DB_NAME=taskflow.db

# JWT secret (change in production!)
JWT_SECRET="your-secure-secret-key"

# Email settings (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`  
Swagger docs at `http://localhost:3000/api-docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add member
- `DELETE /api/teams/:id/members/:userId` - Remove member

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Users
- `GET /api/users` - List users
- `GET /api/users/me` - Get profile
- `PUT /api/users/me` - Update profile

## Development

### Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm start         # Start production server (without PM2)
npm run deploy    # Deploy with PM2 (automated)
```

### PM2 Production Deployment

For production deployments with process management:

```bash
# Automated deployment (recommended)
npm run deploy

# Or manual PM2 commands
npm run build
npm run pm2:start    # Start with PM2
npm run pm2:stop     # Stop application
npm run pm2:restart  # Restart application
npm run pm2:logs     # View logs
npm run pm2:monit    # Monitor application
```

**PM2 Features:**
- ✅ Auto-restart on crashes
- ✅ **Cluster mode with load balancing** (uses all CPU cores)
- ✅ **Automatic scaling** across multiple instances
- ✅ Log management with merge
- ✅ Zero-downtime reloads
- ✅ Startup script generation
- ✅ Graceful shutdown handling

**Scalability:**
The PM2 configuration automatically scales to use all available CPU cores using cluster mode. This enables:
- Load balancing across multiple Node.js processes
- Better CPU utilization
- Higher throughput for concurrent requests
- Fault tolerance (if one process crashes, others continue)

To manually control instances:
```javascript
// In ecosystem.config.js
instances: 'max',  // Use all CPU cores (default)
// OR
instances: 4,      // Specify exact number
```

**First-time PM2 Setup:**
```bash
./deploy.sh
```

This will:
1. Build the application
2. Run database migrations
3. Start with PM2
4. Optionally configure system startup


### Database Commands

```bash
npx prisma migrate dev      # Create and apply migration
npx prisma generate         # Generate Prisma Client
npx prisma studio           # Open Prisma Studio (DB GUI)
```

## Email Configuration

For password reset functionality, configure SMTP in `.env`:

**Gmail Example:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@taskflow.com
```

Without SMTP config, password reset emails will log to console (dev mode).

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite (Prisma ORM)
- **Validation**: Zod
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
task-flow-api/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration history
├── src/
│   ├── controllers/         # Request handlers
│   ├── routes/             # Route definitions
│   ├── schemas/            # Zod validation schemas
│   ├── middleware/         # Express middleware
│   ├── utils/              # Helper functions
│   └── server.ts           # App entry point
├── .env.sample             # Environment template
├── setup.sh                # Automated setup script
└── package.json
```

## License

MIT
