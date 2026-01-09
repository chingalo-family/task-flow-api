# Architecture Guide

This document describes the architecture and design decisions of Task Flow API.

## System Overview

Task Flow API is a RESTful API built using a layered architecture pattern with clear separation of concerns.

```
┌─────────────────────────────────────────────────┐
│              Client Applications                 │
│         (Web, Mobile, Desktop, etc.)            │
└────────────────┬────────────────────────────────┘
                 │ HTTP/HTTPS
                 ▼
┌─────────────────────────────────────────────────┐
│              Express.js Server                   │
│  ┌─────────────────────────────────────────┐   │
│  │         Middleware Layer                 │   │
│  │  • CORS                                  │   │
│  │  • Helmet (Security)                     │   │
│  │  • Morgan (Logging)                      │   │
│  │  • Authentication                        │   │
│  │  • Validation                            │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │         Route Layer                      │   │
│  │  • /api/auth                             │   │
│  │  • /api/tasks                            │   │
│  │  • /api/teams                            │   │
│  │  • /api/users                            │   │
│  │  • /api/notifications                    │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │      Controller Layer                    │   │
│  │  • Request handling                      │   │
│  │  • Response formatting                   │   │
│  │  • Error handling                        │   │
│  └─────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────┘
                 │ Prisma ORM
                 ▼
┌─────────────────────────────────────────────────┐
│            SQLite Database                       │
│  • Users                                        │
│  • Tasks                                        │
│  • Teams                                        │
│  • TeamMembers                                  │
│  • Notifications                                │
└─────────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. Presentation Layer (Routes)

**Location:** `src/routes/`

**Responsibilities:**
- Define API endpoints
- Map HTTP methods to controllers
- Apply middleware (authentication, validation)
- Generate Swagger documentation

**Example:**
```typescript
router.post(
  '/tasks',
  authenticate,              // Auth middleware
  validate(createTaskSchema), // Validation middleware
  createTask                 // Controller
);
```

### 2. Business Logic Layer (Controllers)

**Location:** `src/controllers/`

**Responsibilities:**
- Handle HTTP requests
- Execute business logic
- Interact with database via Prisma
- Format responses
- Handle errors

**Example:**
```typescript
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const taskData = req.body;

    const task = await prisma.task.create({
      data: { ...taskData, userId },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};
```

### 3. Data Access Layer (Prisma)

**Location:** `src/utils/prisma.ts`

**Responsibilities:**
- Database connection management
- Query execution
- Transaction handling
- Type-safe database access

**Example:**
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

### 4. Validation Layer (Schemas)

**Location:** `src/schemas/`

**Responsibilities:**
- Define data validation rules
- Type inference for TypeScript
- Request body validation
- Input sanitization

**Example:**
```typescript
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
});
```

### 5. Middleware Layer

**Location:** `src/middleware/`

**Responsibilities:**
- Authentication (JWT verification)
- Authorization (role-based access)
- Request validation
- Error handling
- Security headers

---

## Design Patterns

### 1. MVC Pattern (Modified)

```
Model (Prisma Schema) ← Controller → View (JSON Response)
                         ↑
                     Validation
```

**Benefits:**
- Clear separation of concerns
- Easy to test and maintain
- Scalable architecture

### 2. Middleware Pattern

**Chain of Responsibility:**
```
Request → CORS → Helmet → Morgan → Auth → Validation → Controller → Response
```

**Benefits:**
- Modular request processing
- Reusable middleware components
- Easy to add/remove features

### 3. Repository Pattern (via Prisma)

Prisma acts as a repository layer:

```typescript
// No need for custom repositories
// Prisma provides type-safe data access
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

**Benefits:**
- Type-safe queries
- Auto-generated client
- Migration management

---

## Data Flow

### Authentication Flow

```
1. Client → POST /api/auth/login
           ↓
2. Validate credentials (Zod)
           ↓
3. Query user from database (Prisma)
           ↓
4. Compare passwords (bcrypt)
           ↓
5. Generate JWT token (jsonwebtoken)
           ↓
6. Return token to client
           ↓
7. Client stores token
           ↓
8. Client includes token in Authorization header
           ↓
9. Server validates token (auth middleware)
           ↓
10. Request proceeds to controller
```

### Task Creation Flow

```
1. Client → POST /api/tasks + JWT token
           ↓
2. CORS middleware (allow request)
           ↓
3. Helmet middleware (security headers)
           ↓
4. Morgan middleware (log request)
           ↓
5. Auth middleware (verify JWT, extract userId)
           ↓
6. Validation middleware (validate request body)
           ↓
7. Controller (create task in database)
           ↓
8. Return created task to client
```

### Team Management Flow

```
1. Create Team
   ↓
2. Add creator as ADMIN (automatic)
   ↓
3. Admin can invite members
   ↓
4. Members can be assigned roles
   ↓
5. Tasks can be assigned to team
   ↓
6. Team members can view/edit team tasks
```

---

## Security Architecture

### Authentication

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "uuid-here",
    "iat": 1641234567,
    "exp": 1641838367
  }
}
```

**Security Measures:**
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed with secret key
- Token expiration (configurable)
- HTTPS recommended for production

### Authorization

**Role-Based Access Control (RBAC):**

```typescript
// Team ADMIN can update team
if (teamMember.role !== 'ADMIN') {
  return res.status(403).json({ error: 'Access denied' });
}
```

**Ownership Validation:**

```typescript
// User can only edit their own tasks
if (task.userId !== req.user!.userId) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### Security Headers (Helmet)

```typescript
import helmet from 'helmet';
app.use(helmet());
```

Adds:
- Content-Security-Policy
- X-DNS-Prefetch-Control
- X-Frame-Options
- X-Content-Type-Options
- And more...

---

## Database Architecture

### Schema Design Principles

1. **Normalization**: Data is normalized to 3NF
2. **UUID Primary Keys**: For distributed systems
3. **Timestamps**: Auto-managed created/updated times
4. **Soft Deletes**: Not implemented (hard deletes used)
5. **Cascade Deletes**: On team membership, subtasks

### Relationships

```
User 1──────────* Task
User 1──────────* Notification
User 1──────────* TeamMember
User 1──────────* Team (as creator)

Team 1──────────* TeamMember
Team 1──────────* Task

Task 1──────────* Task (subtasks)
```

### Indexing Strategy

**Indexed Fields:**
- `User.email` (Unique)
- `User.username` (Unique)
- `TeamMember.teamId_userId` (Unique composite)

**Why:**
- Fast user lookup by email/username
- Prevent duplicate team memberships
- Efficient join operations

---

## API Design Principles

### RESTful Design

**Resource-Based URLs:**
```
/api/tasks              # Collection
/api/tasks/:id          # Individual resource
/api/teams/:id/members  # Nested resource
```

**HTTP Methods:**
- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT` - Update resources
- `DELETE` - Delete resources

### Consistent Response Format

**Success:**
```json
{
  "id": "uuid",
  "title": "Task name",
  ...
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

### Status Codes

- `200` - OK (successful GET/PUT/DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Scalability Considerations

### Horizontal Scaling

**PM2 Cluster Mode:**
```javascript
{
  instances: 'max',  // Use all CPU cores
  exec_mode: 'cluster'
}
```

**Benefits:**
- Load balancing across processes
- Better CPU utilization
- Fault tolerance

### Database Scaling

**SQLite Limitations:**
- Single file database
- Not suitable for high-concurrency writes
- Good for small to medium applications

**Migration Path:**
```
SQLite → PostgreSQL
         (for production scale)
```

**Migration Steps:**
1. Update Prisma schema to PostgreSQL
2. Update DATABASE_URL in .env
3. Run migrations
4. Deploy

### Caching Strategy (Future)

**Not currently implemented, but can add:**

```typescript
// Redis caching
const cachedUser = await redis.get(`user:${userId}`);
if (cachedUser) return JSON.parse(cachedUser);

const user = await prisma.user.findUnique({ where: { id: userId } });
await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 3600);
```

---

## Error Handling Strategy

### Controller-Level Error Handling

```typescript
export const controller = async (req: Request, res: Response) => {
  try {
    // Business logic
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Validation Errors

Handled by Zod validation middleware:

```typescript
// Automatically returns 400 with error details
validate(schema)
```

### Global Error Handler (Future Enhancement)

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});
```

---

## Technology Stack

### Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | >= 16.0.0 |
| TypeScript | Language | ^5.9.3 |
| Express.js | Web framework | ^5.2.1 |
| Prisma | ORM | 5.10.2 |
| SQLite | Database | (via Prisma) |
| Zod | Validation | ^3.23.8 |

### Authentication & Security

| Technology | Purpose |
|------------|---------|
| jsonwebtoken | JWT tokens |
| bcrypt | Password hashing |
| helmet | Security headers |
| cors | CORS handling |

### Development Tools

| Technology | Purpose |
|------------|---------|
| nodemon | Hot reload |
| ts-node | TypeScript execution |
| morgan | HTTP logging |
| swagger | API documentation |

### Production Tools

| Technology | Purpose |
|------------|---------|
| PM2 | Process management |
| Nodemailer | Email sending |

---

## Deployment Architecture

### Development

```
Developer Machine
    ↓
nodemon + ts-node
    ↓
SQLite (local file)
```

### Production

```
         Load Balancer (optional)
                ↓
         PM2 (Cluster Mode)
        ↙     ↓      ↘
   Process1 Process2 Process3
        ↓      ↓      ↓
        SQLite Database
```

**Considerations:**
- SQLite in production has limitations
- Consider PostgreSQL for high-traffic applications
- Use reverse proxy (nginx) for SSL termination

---

## Configuration Management

**Environment-Based Configuration:**

```typescript
const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  database: process.env.DATABASE_URL!,
};
```

**Benefits:**
- Environment-specific settings
- Secrets kept out of code
- Easy to deploy to different environments

---

## Future Enhancements

### Planned Architecture Improvements

1. **Redis Caching**
   - Cache frequently accessed data
   - Improve response times

2. **Message Queue**
   - Async task processing
   - Email sending in background

3. **WebSocket Support**
   - Real-time notifications
   - Live task updates

4. **Microservices (if needed)**
   - Separate auth service
   - Separate notification service

5. **API Versioning**
   - `/api/v1/` prefix
   - Maintain backward compatibility

6. **Rate Limiting**
   - Prevent API abuse
   - Per-user/IP limits

7. **Logging Service**
   - Centralized logging
   - Log aggregation and analysis

---

## Related Documentation

- [Getting Started](./getting-started.md)
- [Development Guide](./development.md)
- [Database Schema](./database-schema.md)
- [API Reference](./api-reference.md)
- [Deployment Guide](./deployment.md)
