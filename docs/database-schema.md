# Database Schema

Task Flow API uses SQLite with Prisma ORM for database management. This document describes the database structure and relationships.

## Database Configuration

**Database Type:** SQLite  
**ORM:** Prisma  
**Location:** Project root (configurable via `.env`)  
**Default File:** `taskflow.db`

## Schema Overview

The database consists of 5 main models:

1. **User** - User accounts and authentication
2. **Task** - Tasks with subtask support
3. **Team** - Team workspaces
4. **TeamMember** - Team membership with roles
5. **Notification** - User notifications

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│    Task     │   │ Notification │
└──────┬──────┘   └──────────────┘
       │
       │ (subtasks)
       └──────┐
              │
              ▼
       ┌─────────────┐
       │    Task     │
       └─────────────┘

       ┌─────────────┐
       │    Team     │
       └──────┬──────┘
              │
              ├──────────────┐
              │              │
              ▼              ▼
       ┌──────────────┐  ┌─────────────┐
       │  TeamMember  │  │    Task     │
       └──────────────┘  └─────────────┘
```

## Models

### User

Stores user account information and authentication data.

**Table:** `User`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | Primary Key, UUID, Default: uuid() |
| username | String | Unique username | Unique, Default: "user" |
| email | String | Email address | Unique, Required |
| password | String | Hashed password | Required (bcrypt) |
| name | String | Full name | Optional |
| phoneNumber | String | Phone number | Optional |
| avatar | String | Avatar URL | Optional |
| resetToken | String | Password reset token | Optional |
| resetTokenExpiry | DateTime | Token expiration | Optional |
| createdAt | DateTime | Creation timestamp | Default: now() |
| updatedAt | DateTime | Last update timestamp | Auto-updated |

**Relationships:**
- Has many `Task` (tasks)
- Has many `Notification` (notifications)
- Has many `TeamMember` (teamMemberships)
- Has many `Team` (createdTeams - as creator)

**Indexes:**
- `username` (Unique)
- `email` (Unique)

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "$2b$10$...", 
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "avatar": "https://example.com/avatar.jpg",
  "resetToken": null,
  "resetTokenExpiry": null,
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### Task

Stores tasks with support for subtasks, tags, and attachments.

**Table:** `Task`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | Primary Key, UUID, Default: uuid() |
| title | String | Task title | Required |
| description | String | Task description | Optional |
| status | String | Task status | Default: "pending" |
| priority | String | Task priority | Default: "medium" |
| category | String | Task category | Optional |
| progress | Int | Completion percentage (0-100) | Default: 0 |
| remindMe | Boolean | Reminder flag | Default: false |
| tags | String | JSON array of tags | Default: "[]" |
| attachments | String | JSON array of attachment URLs | Default: "[]" |
| dueDate | DateTime | Due date | Optional |
| completedAt | DateTime | Completion timestamp | Optional |
| projectId | String | Project identifier | Optional |
| projectName | String | Project name | Optional |
| createdAt | DateTime | Creation timestamp | Default: now() |
| updatedAt | DateTime | Last update timestamp | Auto-updated |
| userId | String | Owner user ID | Foreign Key → User.id |
| teamId | String | Team ID (if team task) | Foreign Key → Team.id, Optional |
| parentTaskId | String | Parent task ID (if subtask) | Foreign Key → Task.id, Optional |

**Relationships:**
- Belongs to `User` (user)
- Belongs to `Team` (team) - Optional
- Belongs to `Task` (parentTask) - Optional, for subtasks
- Has many `Task` (subtasks) - Cascade delete

**Status Values:**
- `pending`
- `in_progress`
- `completed`
- `cancelled`
- Custom values supported

**Priority Values:**
- `low`
- `medium`
- `high`
- `urgent`

**Tags & Attachments:**
Stored as JSON strings, parsed as arrays:

```json
{
  "tags": "[\"backend\", \"api\", \"urgent\"]",
  "attachments": "[\"https://example.com/file.pdf\", \"https://example.com/image.jpg\"]"
}
```

**Example:**
```json
{
  "id": "task-uuid-here",
  "title": "Implement authentication",
  "description": "Add JWT authentication to API",
  "status": "in_progress",
  "priority": "high",
  "category": "backend",
  "progress": 75,
  "remindMe": true,
  "tags": "[\"security\", \"auth\"]",
  "attachments": "[]",
  "dueDate": "2026-01-15T00:00:00.000Z",
  "completedAt": null,
  "projectId": null,
  "projectName": null,
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T14:00:00.000Z",
  "userId": "user-uuid",
  "teamId": null,
  "parentTaskId": null
}
```

---

### Team

Stores team workspaces for collaborative task management.

**Table:** `Team`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | Primary Key, UUID, Default: uuid() |
| name | String | Team name | Required |
| description | String | Team description | Optional |
| icon | String | Team icon (emoji or URL) | Optional |
| color | String | Team color (hex) | Optional |
| avatarUrl | String | Team avatar URL | Optional |
| customTaskStatuses | String | JSON string of custom statuses | Optional |
| createdAt | DateTime | Creation timestamp | Default: now() |
| updatedAt | DateTime | Last update timestamp | Auto-updated |
| createdByUserId | String | Creator user ID | Foreign Key → User.id, Optional |

**Relationships:**
- Belongs to `User` (creator)
- Has many `TeamMember` (members) - Cascade delete
- Has many `Task` (tasks)

**Example:**
```json
{
  "id": "team-uuid",
  "name": "Development Team",
  "description": "Backend development team",
  "icon": "💻",
  "color": "#4A90E2",
  "avatarUrl": null,
  "customTaskStatuses": "[\"backlog\", \"in_progress\", \"review\", \"done\"]",
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z",
  "createdByUserId": "user-uuid"
}
```

---

### TeamMember

Junction table for team membership with role-based access control.

**Table:** `TeamMember`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | Primary Key, UUID, Default: uuid() |
| teamId | String | Team ID | Foreign Key → Team.id |
| userId | String | User ID | Foreign Key → User.id |
| role | String | Member role | Default: "MEMBER" |
| joinedAt | DateTime | Join timestamp | Default: now() |

**Relationships:**
- Belongs to `Team` (team) - Cascade delete
- Belongs to `User` (user) - Cascade delete

**Unique Constraint:**
- (`teamId`, `userId`) - A user can only be a member of a team once

**Role Values:**
- `ADMIN` - Full team management permissions
- `MEMBER` - Basic member permissions

**Permissions:**

| Action | ADMIN | MEMBER |
|--------|-------|--------|
| View team | ✅ | ✅ |
| View tasks | ✅ | ✅ |
| Create tasks | ✅ | ✅ |
| Update team | ✅ | ❌ |
| Delete team | ✅ | ❌ |
| Add members | ✅ | ❌ |
| Remove members | ✅ | ❌ |

**Example:**
```json
{
  "id": "member-uuid",
  "teamId": "team-uuid",
  "userId": "user-uuid",
  "role": "ADMIN",
  "joinedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### Notification

Stores user notifications with support for related entities.

**Table:** `Notification`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Unique identifier | Primary Key, UUID, Default: uuid() |
| title | String | Notification title | Default: "Notification" |
| content | String | Notification content/body | Optional |
| type | String | Notification type | Required |
| isRead | Boolean | Read status | Default: false |
| relatedEntityId | String | Related entity ID | Optional |
| relatedEntityType | String | Related entity type | Optional |
| actorUserId | String | User who triggered notification | Optional |
| actorUsername | String | Actor's username | Optional |
| actorAvatarUrl | String | Actor's avatar URL | Optional |
| createdAt | DateTime | Creation timestamp | Default: now() |
| userId | String | Recipient user ID | Foreign Key → User.id |

**Relationships:**
- Belongs to `User` (user) - Cascade delete

**Notification Types:**
- `task_assigned`
- `task_completed`
- `task_comment`
- `team_invite`
- `team_removed`
- `mention`
- `reminder`
- `custom`

**Example:**
```json
{
  "id": "notification-uuid",
  "title": "Task Assigned",
  "content": "You have been assigned to 'Implement authentication'",
  "type": "task_assigned",
  "isRead": false,
  "relatedEntityId": "task-uuid",
  "relatedEntityType": "task",
  "actorUserId": "admin-user-uuid",
  "actorUsername": "admin",
  "actorAvatarUrl": "https://example.com/admin-avatar.jpg",
  "createdAt": "2026-01-09T12:00:00.000Z",
  "userId": "user-uuid"
}
```

---

## Cascade Deletion Rules

### User Deletion
When a user is deleted:
- ❌ Cannot delete user with existing tasks (must reassign or delete tasks first)
- ✅ All notifications are deleted
- ✅ All team memberships are deleted

### Team Deletion
When a team is deleted:
- ✅ All team members are removed
- ❌ Tasks remain but teamId is set to null

### Task Deletion
When a task is deleted:
- ✅ All subtasks are deleted (cascade)

### Parent Task Deletion
When a parent task is deleted:
- ✅ All subtasks are automatically deleted

---

## Prisma Schema File

The complete schema is defined in `/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(uuid())
  username    String   @unique @default("user")
  email       String   @unique
  password    String
  name        String?
  phoneNumber String?
  avatar      String?
  
  resetToken       String?
  resetTokenExpiry DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tasks         Task[]
  notifications Notification[]
  teamMemberships TeamMember[]
  createdTeams  Team[] @relation("CreatedTeams")
}

// ... (see schema.prisma for complete definition)
```

---

## Database Management

### View Database

Open Prisma Studio to view and edit data:

```bash
npx prisma studio
```

Opens GUI at `http://localhost:5555`

### Create Migration

After modifying `schema.prisma`:

```bash
npx prisma migrate dev --name migration_name
```

### Apply Migrations

Apply pending migrations:

```bash
npx prisma migrate deploy
```

### Reset Database

⚠️ **Warning:** This deletes all data!

```bash
npx prisma migrate reset
```

### Generate Prisma Client

After schema changes:

```bash
npx prisma generate
```

### Format Schema

Format the Prisma schema file:

```bash
npx prisma format
```

---

## Database Files

The SQLite database creates the following files:

```
taskflow.db           # Main database file
taskflow.db-journal   # Temporary journal file (during writes)
```

Both are excluded from Git (see `.gitignore`).

---

## Query Examples

### Using Prisma Client

```typescript
import { prisma } from './utils/prisma';

// Find user with tasks
const userWithTasks = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    tasks: true,
    teamMemberships: {
      include: {
        team: true
      }
    }
  }
});

// Create task with subtasks
const task = await prisma.task.create({
  data: {
    title: 'Main Task',
    userId: 'user-uuid',
    subtasks: {
      create: [
        { title: 'Subtask 1', userId: 'user-uuid' },
        { title: 'Subtask 2', userId: 'user-uuid' }
      ]
    }
  },
  include: {
    subtasks: true
  }
});

// Filter tasks by status
const tasks = await prisma.task.findMany({
  where: {
    userId: 'user-uuid',
    status: 'in_progress',
    priority: 'high'
  },
  include: {
    subtasks: true,
    team: true
  }
});
```

---

## Backup and Restore

### Backup

```bash
# Copy the database file
cp taskflow.db taskflow-backup-$(date +%Y%m%d).db
```

### Restore

```bash
# Restore from backup
cp taskflow-backup-20260109.db taskflow.db
```

### Scheduled Backups

Consider setting up automated backups in production:

```bash
# Add to crontab (daily backup at 2 AM)
# Note: The percent signs don't need escaping in crontab
0 2 * * * cp /path/to/taskflow.db /path/to/backups/taskflow-$(date +%Y%m%d).db
```

---

## Performance Considerations

### Indexes

Current indexes:
- `User.email` (Unique)
- `User.username` (Unique)
- `TeamMember.teamId_userId` (Unique composite)

### Optimization Tips

1. **Pagination**: Use `skip` and `take` for large datasets
2. **Selective Loading**: Use `select` to fetch only needed fields
3. **Batch Operations**: Use `createMany` for bulk inserts
4. **Connection Pooling**: SQLite uses connection pooling by default

### Example Optimized Query

```typescript
// Instead of loading everything
const tasks = await prisma.task.findMany({
  where: { userId: 'user-uuid' },
  select: {
    id: true,
    title: true,
    status: true
  },
  take: 20,
  skip: 0
});
```

---

## Migration to Other Databases

To migrate from SQLite to PostgreSQL or MySQL:

1. Update `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

---

## Related Documentation

- [Getting Started](./getting-started.md)
- [API Reference](./api-reference.md)
- [Development Guide](./development.md)
- [Configuration](./configuration.md)
