# API Reference

Complete API endpoint reference for Task Flow API.

> **💡 Interactive Documentation**: For a fully interactive API experience with "Try it out" functionality, visit the **Swagger UI** at `http://localhost:3000/api-docs` when the server is running.

## Base URL

```
http://localhost:3000/api
```

For production, replace with your server URL.

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Obtaining a Token

Login or register to receive a JWT token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "password": "password123"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800,
  "expiresAt": "2026-01-16T12:00:00.000Z",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phoneNumber": "+1234567890"  // Optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800,
  "expiresAt": "2026-01-16T12:00:00.000Z",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "avatar": null,
    "createdAt": "2026-01-09T12:00:00.000Z"
  }
}
```

**Validation:**
- `username`: Required, unique, 3-30 characters
- `email`: Required, unique, valid email format
- `password`: Required, minimum 6 characters
- `name`: Optional, 1-100 characters
- `phoneNumber`: Optional

---

### Login

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "johndoe",  // Can use email instead
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800,
  "expiresAt": "2026-01-16T12:00:00.000Z",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  }
}
```

**Notes:**
- Can login with either `username` or `email`
- Password is case-sensitive

---

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid-here",
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "avatar": null
}
```

---

### Forgot Password

Request a password reset token.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

**Notes:**
- Email is sent to the user with a reset token
- Token expires after 1 hour (configurable)
- If email is not configured, token is logged to console

---

### Reset Password

Reset password using the token from email.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

---

### Verify Reset Token

Verify if a password reset token is valid.

**Endpoint:** `POST /api/auth/verify-reset-token`

**Request Body:**
```json
{
  "token": "reset-token-from-email"
}
```

**Response:** `200 OK`
```json
{
  "message": "Token is valid",
  "email": "john@example.com"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "Invalid or expired token"
}
```

**Notes:**
- Use this endpoint to verify token validity before showing password reset form
- Returns the user's email if token is valid

---

### Change Password

Change password for the currently authenticated user.

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "newPassword": "newSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800,
  "expiresAt": "2026-01-16T12:00:00.000Z"
}
```

**Notes:**
- Requires authentication
- Returns a new JWT token after password change
- Old tokens remain valid until expiration

---

## User Endpoints

### List Users

Get a list of all users (searchable).

**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `search`: Search by name, email, or username (optional)

**Example:**
```
GET /api/users?search=john
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "avatar": null,
    "createdAt": "2026-01-09T12:00:00.000Z"
  }
]
```

---

### Get User Profile

Get the authenticated user's profile.

**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid-here",
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "avatar": null
}
```

---

### Update User Profile

Update the authenticated user's profile.

**Endpoint:** `PUT /api/users/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-here",
  "username": "johndoe",
  "email": "newemail@example.com",
  "name": "John Updated",
  "phoneNumber": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

## Task Endpoints

### List Tasks

Get all tasks for the authenticated user with optional filters.

**Endpoint:** `GET /api/tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (e.g., `pending`, `in_progress`, `completed`)
- `priority`: Filter by priority (e.g., `low`, `medium`, `high`)

**Example:**
```
GET /api/tasks?status=in_progress&priority=high
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-here",
    "title": "Complete API documentation",
    "description": "Write comprehensive API docs",
    "status": "in_progress",
    "priority": "high",
    "category": "documentation",
    "progress": 50,
    "tags": ["docs", "api"],
    "attachments": [],
    "subtasks": [],
    "assignedUserIds": [], 
    "dueDate": "2026-01-15T00:00:00.000Z",
    "completedAt": null,
    "createdAt": "2026-01-09T12:00:00.000Z",
    "updatedAt": "2026-01-09T14:00:00.000Z",
    "userId": "user-uuid",
    "teamId": null
  }
]
```

---

### Create Task

Create a new task.

**Endpoint:** `POST /api/tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "category": "development",
  "progress": 0,
  "tags": ["backend", "api"],
  "attachments": ["https://example.com/file.pdf"],
  "dueDate": "2026-01-20T00:00:00.000Z",
  "teamId": "team-uuid",  // Optional
  "assignedUserIds": ["user-uuid-1", "user-uuid-2"], // Optional
  "subtasks": [           // Optional
    {
      "title": "Subtask 1",
      "isCompleted": false
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "task-uuid",
  "title": "New Task",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "category": "development",
  "progress": 0,
  "tags": ["backend", "api"],
  "attachments": ["https://example.com/file.pdf"],
  "subtasks": [
      {
          "title": "Subtask 1",
          "isCompleted": false,
          ...
      }
  ],
  "assignedUserIds": ["user-uuid-1", "user-uuid-2"],
  "dueDate": "2026-01-20T00:00:00.000Z",
  "completedAt": null,
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z",
  "userId": "user-uuid",
  "teamId": "team-uuid"
}
```

---

### Get Task

Get a specific task by ID.

**Endpoint:** `GET /api/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "task-uuid",
  "title": "Task Title",
  "description": "Task description",
  "status": "in_progress",
  "priority": "high",
  "category": "development",
  "progress": 75,
  "tags": ["api", "backend"],
  "attachments": [],
  "subtasks": [
    {
      "id": "subtask-uuid",
      "title": "Subtask 1",
      "isCompleted": true,
      "status": "completed"
    }
  ],
  "assignedUserIds": [],
  "dueDate": "2026-01-15T00:00:00.000Z",
  "completedAt": null,
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T14:00:00.000Z",
  "userId": "user-uuid",
  "teamId": null,
  "team": null
}
```

---

### Update Task

Update an existing task.

**Endpoint:** `PUT /api/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "status": "completed",
  "progress": 100,
  "completedAt": "2026-01-09T15:00:00.000Z"
}
```

**Response:** `200 OK`
```json
{
  "id": "task-uuid",
  "title": "Updated Task Title",
  "status": "completed",
  "progress": 100,
  "completedAt": "2026-01-09T15:00:00.000Z",
  ...
}
```

---

### Delete Task

Delete a task.

**Endpoint:** `DELETE /api/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

**Notes:**
- Deleting a task also deletes all its subtasks (cascade delete)
- Only the task owner can delete their tasks

---

## Team Endpoints

### List Teams

Get all teams the authenticated user is a member of.

**Endpoint:** `GET /api/teams`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "team-uuid",
    "name": "Development Team",
    "description": "Backend development team",
    "icon": "💻",
    "color": "#4A90E2",
    "avatarUrl": null,
    "customTaskStatuses": null,
    "createdAt": "2026-01-09T12:00:00.000Z",
    "updatedAt": "2026-01-09T12:00:00.000Z"
  }
]
```

---

### Create Team

Create a new team (creator is automatically added as ADMIN).

**Endpoint:** `POST /api/teams`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Development Team",
  "description": "Backend development team",
  "icon": "💻",
  "color": "#4A90E2"
}
```

**Response:** `201 Created`
```json
{
  "id": "team-uuid",
  "name": "Development Team",
  "description": "Backend development team",
  "icon": "💻",
  "color": "#4A90E2",
  "avatarUrl": null,
  "customTaskStatuses": null,
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z",
  "createdByUserId": "user-uuid"
}
```

---

### Get Team

Get team details including members.

**Endpoint:** `GET /api/teams/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "team-uuid",
  "name": "Development Team",
  "description": "Backend development team",
  "icon": "💻",
  "color": "#4A90E2",
  "members": [
    {
      "id": "member-uuid",
      "role": "ADMIN",
      "user": {
        "id": "user-uuid",
        "username": "johndoe",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": null
      },
      "joinedAt": "2026-01-09T12:00:00.000Z"
    }
  ],
  "createdAt": "2026-01-09T12:00:00.000Z",
  "updatedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### Update Team

Update team details (ADMIN only).

**Endpoint:** `PUT /api/teams/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Team Name",
  "description": "Updated description",
  "color": "#E24A90"
}
```

**Response:** `200 OK`
```json
{
  "id": "team-uuid",
  "name": "Updated Team Name",
  "description": "Updated description",
  "color": "#E24A90",
  ...
}
```

---

### Delete Team

Delete a team (ADMIN only).

**Endpoint:** `DELETE /api/teams/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Team deleted successfully"
}
```

---

### Add Team Member

Add a user to a team (ADMIN only).

**Endpoint:** `POST /api/teams/:id/members`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "role": "MEMBER"  // ADMIN or MEMBER
}
```

**Response:** `201 Created`
```json
{
  "id": "member-uuid",
  "teamId": "team-uuid",
  "userId": "user-uuid",
  "role": "MEMBER",
  "joinedAt": "2026-01-09T12:00:00.000Z"
}
```

---

### Remove Team Member

Remove a user from a team (ADMIN only).

**Endpoint:** `DELETE /api/teams/:id/members/:userId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Member removed successfully"
}
```

---

## Notification Endpoints

### List Notifications

Get all notifications for the authenticated user.

**Endpoint:** `GET /api/notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `unreadOnly`: Set to `true` to get only unread notifications

**Example:**
```
GET /api/notifications?unreadOnly=true
```

**Response:** `200 OK`
```json
[
  {
    "id": "notification-uuid",
    "title": "Task Assigned",
    "content": "You have been assigned a new task",
    "type": "task_assigned",
    "isRead": false,
    "relatedEntityId": "task-uuid",
    "relatedEntityType": "task",
    "actorUserId": "user-uuid",
    "actorUsername": "johndoe",
    "actorAvatarUrl": null,
    "createdAt": "2026-01-09T12:00:00.000Z"
  }
]
```

---

### Create Notification

Create a notification for a user.

**Endpoint:** `POST /api/notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "target-user-uuid",
  "title": "New Notification",
  "content": "Notification content",
  "type": "custom",
  "relatedEntityId": "entity-uuid",
  "relatedEntityType": "task"
}
```

**Response:** `201 Created`
```json
{
  "id": "notification-uuid",
  "title": "New Notification",
  "content": "Notification content",
  "type": "custom",
  "isRead": false,
  "relatedEntityId": "entity-uuid",
  "relatedEntityType": "task",
  "createdAt": "2026-01-09T12:00:00.000Z"
}
```

---

### Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `PUT /api/notifications/:id/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "notification-uuid",
  "isRead": true,
  ...
}
```

---

### Mark All Notifications as Read

Mark all notifications as read for the authenticated user.

**Endpoint:** `PUT /api/notifications/read-all`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "All notifications marked as read"
}
```

---

### Delete Notification

Delete a notification.

**Endpoint:** `DELETE /api/notifications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Notification deleted successfully"
}
```

---

## Error Responses

All endpoints return a standardized error response format when something goes wrong:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [], // Optional: array of sub-errors (e.g., validation fields)
  "stack": "..." // Only available in development environment
}
```

### 400 Bad Request (Validation)
Returned when request parameters or body fail validation.
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "path": "body.email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
Returned when authentication is missing or invalid.
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
Returned when the authenticated user doesn't have permissions for the resource.
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
Returned when the requested resource doesn't exist.
```json
{
  "success": false,
  "message": "Task not found"
}
```

### 500 Internal Server Error
Returned for unexpected server-side issues.
```json
{
  "success": false,
  "message": "Something went wrong"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider adding rate limiting middleware to prevent abuse.

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

---

## Swagger UI - Interactive Documentation

> **🎯 Recommended**: For the most complete and up-to-date API documentation, use the **Swagger UI** at:
>
> ```
> http://localhost:3000/api-docs
> ```

The Swagger UI provides:
- ✅ **Try-it-out functionality** - Test endpoints directly from your browser
- ✅ **Real-time validation** - See request/response schemas
- ✅ **Authentication testing** - Easily test protected endpoints
- ✅ **Auto-generated examples** - See example requests and responses
- ✅ **Complete endpoint coverage** - All endpoints are documented
- ✅ **Always up-to-date** - Generated from source code annotations

### Using Swagger UI

1. Start the server: `npm run dev`
2. Open `http://localhost:3000/api-docs` in your browser
3. Click **Authorize** button (top-right)
4. Enter your JWT token from login/register
5. Try any endpoint using **Try it out** button

---

## Additional Resources

- [Getting Started](./getting-started.md) - Setup and installation
- [Configuration](./configuration.md) - Environment variables
- [Database Schema](./database-schema.md) - Database structure
- [API Status](./api-status.md) - Feature implementation status
- [Development Guide](./development.md) - Development workflow
- [Troubleshooting](./troubleshooting.md) - Common issues
