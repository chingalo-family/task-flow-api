# Development Guide

This guide covers everything you need to know for developing Task Flow API.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Building and Running](#building-and-running)
5. [Database Management](#database-management)
6. [API Development](#api-development)
7. [Authentication Flow](#authentication-flow)
8. [Error Handling](#error-handling)
9. [Logging](#logging)
10. [Debugging](#debugging)

---

## Development Environment Setup

### Required Tools

Install the following tools:

```bash
# Node.js and npm (v16+ required, v18 LTS recommended)
node --version  # Should be >= 16.0.0
npm --version   # Should be >= 7.0.0

# Git
git --version
```

### Recommended VS Code Extensions

- **Prisma** - Syntax highlighting for Prisma schema
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatter
- **REST Client** - Test API endpoints in VS Code
- **Thunder Client** - Alternative API testing tool
- **GitLens** - Enhanced Git capabilities

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/chingalo-family/task-flow-api.git
cd task-flow-api

# Run setup script
./setup.sh

# Or manual setup
cp .env.sample .env
npm install
npx prisma generate
npx prisma migrate dev --name init
```

---

## Project Structure

```
task-flow-api/
├── docs/                    # Documentation
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration files
├── src/                    # Source code
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── task.controller.ts
│   │   ├── team.controller.ts
│   │   ├── user.controller.ts
│   │   └── notification.controller.ts
│   ├── routes/            # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── task.routes.ts
│   │   ├── team.routes.ts
│   │   ├── user.routes.ts
│   │   └── notification.routes.ts
│   ├── schemas/           # Validation schemas (Zod)
│   │   ├── auth.schema.ts
│   │   ├── task.schema.ts
│   │   ├── team.schema.ts
│   │   ├── user.schema.ts
│   │   └── notification.schema.ts
│   ├── middleware/        # Express middleware
│   │   └── auth.middleware.ts
│   ├── utils/            # Helper functions
│   │   ├── prisma.ts     # Prisma client instance
│   │   ├── validate.ts   # Validation middleware
│   │   ├── email.ts      # Email utilities
│   │   └── swagger.ts    # Swagger configuration
│   └── server.ts         # Application entry point
├── dist/                 # Compiled JavaScript (generated)
├── .env.sample          # Environment template
├── .env                 # Environment variables (gitignored)
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── ecosystem.config.js # PM2 configuration
├── setup.sh           # Setup script
└── deploy.sh          # Deployment script
```

### File Responsibilities

| Directory | Purpose |
|-----------|---------|
| `controllers/` | Handle HTTP requests, call business logic, return responses |
| `routes/` | Define API endpoints and attach controllers |
| `schemas/` | Define Zod validation schemas for request data |
| `middleware/` | Custom Express middleware (auth, validation, etc.) |
| `utils/` | Helper functions and shared utilities |

---

## Development Workflow

### Starting Development Server

```bash
# Start with hot reload (nodemon)
npm run dev

# Server runs on http://localhost:3000
# Swagger docs at http://localhost:3000/api-docs
```

The development server automatically restarts when you modify files.

### Making Changes

#### 1. Adding a New Endpoint

**Step 1: Define Schema (src/schemas/)**

```typescript
// src/schemas/post.schema.ts
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
```

**Step 2: Create Controller (src/controllers/)**

```typescript
// src/controllers/post.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { CreatePostInput } from '../schemas/post.schema';

export const createPost = async (
  req: Request<{}, {}, CreatePostInput>,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const { title, content, tags } = req.body;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        tags: JSON.stringify(tags || []),
        userId,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};
```

**Step 3: Define Route (src/routes/)**

```typescript
// src/routes/post.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validate';
import { createPostSchema } from '../schemas/post.schema';
import { createPost } from '../controllers/post.controller';

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post('/', authenticate, validate(createPostSchema), createPost);

export default router;
```

**Step 4: Register Route (src/server.ts)**

```typescript
import postRoutes from './routes/post.routes';

// ... other imports

app.use('/api/posts', postRoutes);
```

#### 2. Updating Database Schema

**Step 1: Modify Prisma Schema**

```prisma
// prisma/schema.prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  tags      String   @default("[]")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

**Step 2: Create Migration**

```bash
npx prisma migrate dev --name add_post_model
```

**Step 3: Regenerate Prisma Client**

```bash
npx prisma generate
```

---

## Building and Running

### Development Mode

```bash
npm run dev
```

Features:
- Hot reload with nodemon
- TypeScript compilation on-the-fly
- Detailed error messages
- Auto-restart on file changes

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Output in dist/ directory
```

### Production Mode

```bash
# Run compiled JavaScript
npm start

# Or with PM2
npm run deploy
```

---

## Database Management

### Prisma Studio

Visual database editor:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

### Common Database Commands

```bash
# Create and apply migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Format schema file
npx prisma format

# View migration status
npx prisma migrate status
```

### Seeding Data

Create a seed script for development data:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  // Create test tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Task 1',
        description: 'First test task',
        userId: user.id,
        status: 'pending',
      },
      {
        title: 'Task 2',
        description: 'Second test task',
        userId: user.id,
        status: 'in_progress',
      },
    ],
  });

  console.log('Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:

```bash
npx ts-node prisma/seed.ts
```

---

## API Development

### Request Validation

Use Zod schemas with the validation middleware:

```typescript
import { z } from 'zod';
import { validate } from '../utils/validate';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', validate(schema), loginController);
```

### Response Formats

#### Success Response

```typescript
res.status(200).json({
  id: 'uuid',
  name: 'John Doe',
  email: 'john@example.com',
});
```

#### Error Response

```typescript
res.status(400).json({
  error: 'Validation failed',
});
```

#### Created Response

```typescript
res.status(201).json({
  id: 'new-uuid',
  // ... created resource
});
```

### Pagination

Implement pagination for list endpoints:

```typescript
export const listTasks = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const tasks = await prisma.task.findMany({
    where: { userId: req.user!.userId },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.task.count({
    where: { userId: req.user!.userId },
  });

  res.json({
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};
```

---

## Authentication Flow

### JWT Token Generation

```typescript
import jwt from 'jsonwebtoken';

const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRATION || '7d' }
  );
};
```

### Authentication Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Protected Routes

```typescript
router.get('/protected', authenticate, protectedController);
```

---

## Error Handling

### Consistent Error Responses

```typescript
// Utility function
const handleError = (res: Response, error: any, message: string) => {
  console.error(message, error);
  res.status(500).json({ error: message });
};

// Usage in controller
try {
  // ... logic
} catch (error) {
  handleError(res, error, 'Failed to create resource');
}
```

### Validation Errors

```typescript
// Handled automatically by Zod validation middleware
router.post('/endpoint', validate(schema), controller);

// Returns 400 with validation errors
```

---

## Logging

### Console Logging

```typescript
// Development logging
console.log('User registered:', user.email);
console.error('Database error:', error);
```

### Morgan HTTP Logging

Already configured in `server.ts`:

```typescript
import morgan from 'morgan';

app.use(morgan('dev')); // Logs all HTTP requests
```

Output:
```
GET /api/users 200 45.123 ms - 1234
POST /api/auth/login 401 12.456 ms - 27
```

---

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/server.ts"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### Debugging Tips

1. **Set breakpoints** in VS Code
2. **Use debugger statement** in code
3. **Inspect variables** in debug console
4. **Check Prisma queries** with logging:

```typescript
// Development - all logs
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Production - errors and warnings only (better performance)
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});
```

---

## Testing API Endpoints

### Using Swagger UI

1. Open `http://localhost:3000/api-docs`
2. Click "Authorize" and enter JWT token
3. Try endpoints with "Try it out"

### Using curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get profile (with token)
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using REST Client (VS Code)

Create `api.http`:

```http
### Register
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Profile
GET http://localhost:3000/api/users/me
Authorization: Bearer {{token}}
```

---

## Hot Reload

Nodemon configuration in `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts"
  }
}
```

Automatically watches:
- `*.ts` files
- `*.json` files

Ignores:
- `node_modules/`
- `dist/`
- `*.db` files

---

## Environment Variables

Development `.env`:

```env
DB_NAME=taskflow-dev.db
DATABASE_URL="file:./${DB_NAME}"
PORT=3000
JWT_SECRET="dev-secret-change-in-production"
JWT_EXPIRATION=7d
RESET_TOKEN_EXPIRATION=3600000
FRONTEND_URL=http://localhost:3000
```

See [Configuration Guide](./configuration.md) for all options.

---

## Next Steps

- Read [API Reference](./api-reference.md) for endpoint details
- Check [Database Schema](./database-schema.md) for data models
- Review [Contributing Guidelines](./contributing.md) before submitting PRs
- See [Architecture Guide](./architecture.md) for system design

---

## Common Development Tasks

### Add a New Model

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_model_name`
3. Create controller in `src/controllers/`
4. Create routes in `src/routes/`
5. Create validation schemas in `src/schemas/`
6. Register routes in `src/server.ts`
7. Update API documentation

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update

# Update Prisma
npm update @prisma/client prisma
npx prisma generate
```

### Clean Build

```bash
# Remove build artifacts
rm -rf dist/

# Rebuild
npm run build
```

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod Documentation](https://zod.dev/)
- [JWT Introduction](https://jwt.io/introduction)
