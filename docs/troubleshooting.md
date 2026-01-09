# Troubleshooting Guide

Common issues and solutions for Task Flow API.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Server Issues](#server-issues)
3. [Database Issues](#database-issues)
4. [Authentication Issues](#authentication-issues)
5. [Email Issues](#email-issues)
6. [PM2 Issues](#pm2-issues)
7. [Performance Issues](#performance-issues)
8. [API Errors](#api-errors)

---

## Installation Issues

### npm install Fails

**Error:**
```
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules
```

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $USER /usr/local/lib/node_modules
sudo chown -R $USER ~/.npm

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

---

### Prisma Generate Fails

**Error:**
```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
# Install Prisma
npm install @prisma/client prisma

# Generate client
npx prisma generate
```

---

### Setup Script Permission Denied

**Error:**
```
bash: ./setup.sh: Permission denied
```

**Solution:**
```bash
# Make script executable
chmod +x setup.sh
chmod +x deploy.sh

# Run setup
./setup.sh
```

---

## Server Issues

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution 1: Kill Process Using Port**
```bash
# Find process
lsof -i :3000
# or
netstat -tuln | grep 3000

# Kill process
kill -9 <PID>
```

**Solution 2: Change Port**
```bash
# Edit .env
PORT=3001

# Restart server
npm run dev
```

---

### Server Won't Start

**Error:**
```
TypeError: Cannot read property 'JWT_SECRET' of undefined
```

**Solution:**
```bash
# Ensure .env file exists
cp .env.sample .env

# Edit .env and set required variables
nano .env

# Restart server
npm run dev
```

---

### Module Not Found Error

**Error:**
```
Error: Cannot find module './dist/server.js'
```

**Solution:**
```bash
# Build the application
npm run build

# Then start
npm start
```

---

## Database Issues

### Migration Fails

**Error:**
```
Error: P3009: migrate found failed migration
```

**Solution 1: Mark Migration as Applied**
```bash
npx prisma migrate resolve --applied <migration_name>
```

**Solution 2: Reset Database (⚠️ Deletes Data)**
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

### Database Locked

**Error:**
```
Error: SQLITE_BUSY: database is locked
```

**Solution:**
```bash
# Stop all processes accessing the database
pm2 stop all
# or
pkill node

# Remove journal file
rm taskflow.db-journal

# Restart
pm2 restart all
```

---

### Cannot Connect to Database

**Error:**
```
Error: Can't reach database server
```

**Solution:**
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Should be: DATABASE_URL="file:./taskflow.db"

# Ensure database file exists or create it
npx prisma migrate deploy
```

---

### Prisma Client Not Generated

**Error:**
```
PrismaClient is unable to be run in the browser
```

**Solution:**
```bash
# Generate Prisma Client
npx prisma generate

# Restart server
npm run dev
```

---

## Authentication Issues

### JWT Token Invalid

**Error:**
```
{
  "error": "Invalid token"
}
```

**Causes & Solutions:**

**1. Token Expired:**
```bash
# Get new token by logging in again
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

**2. JWT_SECRET Changed:**
```bash
# All existing tokens become invalid when JWT_SECRET changes
# Users must login again
# Don't change JWT_SECRET in production without reason
```

**3. Malformed Token:**
```bash
# Ensure Authorization header format is correct
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Login Returns 401

**Error:**
```
{
  "error": "Invalid credentials"
}
```

**Causes & Solutions:**

**1. Wrong Password:**
- Check password is correct
- Password is case-sensitive

**2. User Doesn't Exist:**
```bash
# Check user exists
npx prisma studio
# Look in User table
```

**3. Email vs Username:**
```bash
# Can login with either email OR username
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"password"}'
```

---

### Password Reset Not Working

**Error:**
```
{
  "error": "Invalid or expired reset token"
}
```

**Causes & Solutions:**

**1. Token Expired:**
- Reset tokens expire after 1 hour (configurable)
- Request a new reset token

**2. Token Already Used:**
- Each token can only be used once
- Request a new reset token

**3. Wrong Token:**
- Copy the exact token from email
- Check for extra spaces or line breaks

---

## Email Issues

### Email Not Sending

**Error:**
```
Failed to send password reset email
```

**Causes & Solutions:**

**1. SMTP Not Configured:**
```bash
# Check .env file has SMTP settings
cat .env | grep SMTP

# If missing, configure:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@taskflow.com
```

**2. Invalid Credentials:**
- Gmail: Must use App Password, not regular password
- Generate at: https://myaccount.google.com/apppasswords
- 2FA must be enabled

**3. Firewall Blocking:**
```bash
# Check port 587 is allowed
sudo ufw status

# Allow SMTP port
sudo ufw allow 587/tcp
```

**4. Development Mode:**
- Without SMTP config, emails log to console
- Check server logs for email content

---

### Gmail App Password Not Working

**Error:**
```
Error: Invalid login: 535 Authentication failed
```

**Solution:**
```bash
# 1. Enable 2-Factor Authentication on Gmail
# 2. Generate App Password:
#    https://myaccount.google.com/apppasswords
# 3. Use 16-character app password in .env
SMTP_PASS=abcd efgh ijkl mnop  # Remove spaces!

# Should be:
SMTP_PASS=abcdefghijklmnop
```

---

## PM2 Issues

### PM2 Command Not Found

**Error:**
```
bash: pm2: command not found
```

**Solution:**
```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 status
```

---

### PM2 App Not Starting

**Error:**
```
[PM2][ERROR] Script not found: ./dist/server.js
```

**Solution:**
```bash
# Build the application first
npm run build

# Then start PM2
pm2 start ecosystem.config.js --env production
```

---

### PM2 App Keeps Restarting

**Check Logs:**
```bash
pm2 logs task-flow-api --lines 50
```

**Common Causes:**

**1. Port Already in Use:**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Restart PM2
pm2 restart task-flow-api
```

**2. Missing Dependencies:**
```bash
npm install

# Rebuild
npm run build

# Restart
pm2 restart task-flow-api
```

**3. Database Issues:**
```bash
# Check database connection
npx prisma migrate deploy
npx prisma generate

# Restart
pm2 restart task-flow-api
```

---

### PM2 Startup Not Working

**Error:**
```
PM2 not starting on system boot
```

**Solution:**
```bash
# Regenerate startup script
pm2 unstartup
pm2 startup

# Follow the output instructions (usually a sudo command)
# Example:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Save process list
pm2 save
```

---

## Performance Issues

### Slow API Response

**Causes & Solutions:**

**1. Database Not Indexed:**
- Current indexes on email and username
- Add more if needed for frequently queried fields

**2. Loading Too Much Data:**
```typescript
// Bad: Loading everything
const tasks = await prisma.task.findMany({
  include: { subtasks: true, team: true }
});

// Good: Select only needed fields
const tasks = await prisma.task.findMany({
  select: {
    id: true,
    title: true,
    status: true
  },
  take: 20  // Pagination
});
```

**3. Not Using Cluster Mode:**
```bash
# Check PM2 is using cluster mode
pm2 describe task-flow-api

# Should show:
# exec mode: cluster
# instances: 4 (or max)
```

---

### High Memory Usage

**Solution 1: Restart PM2**
```bash
pm2 restart task-flow-api
```

**Solution 2: Adjust Memory Limit**
```javascript
// ecosystem.config.js
max_memory_restart: '2G'  // Increase limit
```

**Solution 3: Reduce Instances**
```javascript
// ecosystem.config.js
instances: 2  // Instead of 'max'
```

---

### High CPU Usage

**Check with PM2:**
```bash
pm2 monit
```

**Solutions:**

**1. Reduce PM2 Instances:**
```bash
pm2 scale task-flow-api 2
```

**2. Optimize Database Queries:**
- Use `select` to fetch only needed fields
- Add pagination
- Use indexes

**3. Check for Infinite Loops:**
```bash
pm2 logs --err
```

---

## API Errors

### 400 Bad Request

**Error:**
```json
{
  "error": "Validation error"
}
```

**Causes:**
- Missing required fields
- Invalid data format
- Type mismatch

**Solution:**
Check Swagger docs for correct request format:
```
http://localhost:3000/api-docs
```

---

### 401 Unauthorized

**Error:**
```json
{
  "error": "No token provided"
}
```

**Solutions:**

**1. Missing Authorization Header:**
```bash
# Include token in header
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users/me
```

**2. Incorrect Header Format:**
```bash
# Wrong:
Authorization: YOUR_TOKEN

# Correct:
Authorization: Bearer YOUR_TOKEN
```

---

### 403 Forbidden

**Error:**
```json
{
  "error": "Access denied"
}
```

**Causes:**
- Trying to access another user's resources
- Insufficient permissions (not team ADMIN)

**Solution:**
- Ensure you're accessing your own resources
- Check team role permissions

---

### 404 Not Found

**Error:**
```json
{
  "error": "Resource not found"
}
```

**Causes:**
- Resource doesn't exist
- Wrong ID
- Resource was deleted

**Solution:**
```bash
# Verify resource exists
npx prisma studio

# Check correct ID format (UUID)
# Example: 550e8400-e29b-41d4-a716-446655440000
```

---

### 500 Internal Server Error

**Error:**
```json
{
  "error": "Internal server error"
}
```

**Solution:**
```bash
# Check server logs
npm run dev  # Development
# or
pm2 logs     # Production

# Common causes:
# - Database connection issue
# - Missing environment variables
# - Unhandled exception in code
```

---

## CORS Errors

**Error (in browser):**
```
Access to fetch at 'http://localhost:3000/api/auth/login' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
CORS is enabled by default for all origins in development.

For production, configure CORS:

```typescript
// src/server.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL,  // Set in .env
  credentials: true
}));
```

```env
# .env
FRONTEND_URL=https://yourdomain.com
```

---

## Database File Issues

### Database File Not Found

**Error:**
```
Error: ENOENT: no such file or directory, open 'taskflow.db'
```

**Solution:**
```bash
# Run migrations to create database
npx prisma migrate dev --name init

# Or in production
npx prisma migrate deploy
```

---

### Database Corruption

**Error:**
```
Error: SQLITE_CORRUPT: database disk image is malformed
```

**Solution:**
```bash
# 1. Stop server
pm2 stop all

# 2. Backup current database (if possible)
cp taskflow.db taskflow-backup.db

# 3. Try to repair
sqlite3 taskflow.db "PRAGMA integrity_check"

# 4. If unrepairable, restore from backup
cp /path/to/backup/taskflow.db ./taskflow.db

# 5. Restart server
pm2 restart all
```

---

## Swagger/API Docs Issues

### Swagger Not Loading

**Error:**
```
Cannot GET /api-docs
```

**Solutions:**

**1. Check Server is Running:**
```bash
curl http://localhost:3000/api-docs
```

**2. Check Port:**
```bash
# Verify PORT in .env matches your request
cat .env | grep PORT
```

**3. Check Swagger Configuration:**
```typescript
// Should be in src/server.ts
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

---

## Getting More Help

If your issue isn't listed here:

1. **Check Logs:**
   ```bash
   # Development
   npm run dev
   
   # Production
   pm2 logs
   ```

2. **Search GitHub Issues:**
   https://github.com/chingalo-family/task-flow-api/issues

3. **Create New Issue:**
   - Include error messages
   - Include relevant logs
   - Describe steps to reproduce
   - Include environment details

4. **Check Documentation:**
   - [Getting Started](./getting-started.md)
   - [Configuration](./configuration.md)
   - [API Reference](./api-reference.md)
   - [Development Guide](./development.md)

---

## Debug Checklist

When troubleshooting, check:

- [ ] Server is running
- [ ] `.env` file exists and is configured
- [ ] Database file exists
- [ ] Prisma client is generated
- [ ] Dependencies are installed
- [ ] Port is not in use
- [ ] Correct Node.js version (>= 16)
- [ ] Firewall allows connections
- [ ] Logs show the actual error
- [ ] Request format matches API docs

---

## Common Error Messages Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `EADDRINUSE` | Port in use | Kill process or change port |
| `MODULE_NOT_FOUND` | Missing dependency | `npm install` |
| `Cannot find module '@prisma/client'` | Prisma not generated | `npx prisma generate` |
| `Invalid token` | JWT expired/invalid | Login again |
| `No token provided` | Missing auth header | Add `Authorization: Bearer <token>` |
| `Access denied` | Insufficient permissions | Check ownership/role |
| `Resource not found` | Wrong ID | Verify resource exists |
| `Validation error` | Invalid input | Check request format |
| `SQLITE_BUSY` | Database locked | Stop processes, remove journal |
| `P3009` | Failed migration | Reset or mark as applied |

---

## Related Documentation

- [Getting Started](./getting-started.md)
- [Configuration](./configuration.md)
- [Deployment](./deployment.md)
- [Development](./development.md)
- [API Reference](./api-reference.md)
