# Configuration Guide

This guide explains all configuration options available in Task Flow API through environment variables.

## Environment Variables

All configuration is managed through the `.env` file in the root directory. Create this file from the template:

```bash
cp .env.sample .env
```

## Configuration Sections

### Database Configuration

```env
# Database name (SQLite file)
DB_NAME=taskflow.db

# Database URL (Prisma connection string)
DATABASE_URL="file:./${DB_NAME}"
```

**Options:**

- `DB_NAME`: Name of the SQLite database file (default: `taskflow.db`)
- `DATABASE_URL`: Prisma connection string (automatically uses DB_NAME)

**Notes:**
- The database file will be created in the project root
- Multiple databases can be used by changing `DB_NAME`
- Database files are excluded from Git (see `.gitignore`)

**Example - Multiple Environments:**

```env
# Development
DB_NAME=taskflow-dev.db

# Testing
DB_NAME=taskflow-test.db

# Production
DB_NAME=taskflow-prod.db
```

### Server Configuration

```env
# Port number for the API server
PORT=3000

# Public URL (optional, for Swagger documentation)
PUBLIC_URL=
```

**Options:**

- `PORT`: Port number the server listens on (default: `3000`)
- `PUBLIC_URL`: Full URL for production deployments (optional)
  - Used in Swagger "Try it out" feature
  - Example: `https://api.yourdomain.com`
  - Leave empty for development

**Production Example:**

```env
PORT=3000
PUBLIC_URL=https://api.taskflow.com
```

### JWT Configuration

```env
# Secret key for signing JWT tokens
JWT_SECRET="your-secret-key-here-change-in-production"

# Token expiration time
JWT_EXPIRATION=7d
```

**Options:**

- `JWT_SECRET`: Secret key for signing and verifying JWT tokens
  - **CRITICAL**: Change this in production!
  - Use a strong, random string (32+ characters)
  - Never commit the actual secret to Git

- `JWT_EXPIRATION`: How long tokens remain valid
  - Format: number + unit (s/m/h/d)
  - Examples:
    - `60s` - 60 seconds
    - `30m` - 30 minutes
    - `24h` - 24 hours
    - `7d` - 7 days (default)

**Generating a Secure JWT Secret:**

```bash
# Using Node.js (recommended - run in a secure environment)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using online tool (use with caution)
# https://randomkeygen.com/
```

**Security Note:** Generate secrets in a secure environment and handle the output securely. Never share or commit your JWT_SECRET.

**Security Recommendations:**
- Use at least 32 characters
- Mix letters, numbers, and special characters
- Different secret for each environment
- Rotate secrets periodically

### Password Reset Configuration

```env
# Reset token expiration (in milliseconds)
RESET_TOKEN_EXPIRATION=3600000
```

**Options:**

- `RESET_TOKEN_EXPIRATION`: How long password reset tokens are valid (in milliseconds)

**Common Values:**
- `1800000` - 30 minutes
- `3600000` - 1 hour (default)
- `7200000` - 2 hours

**Formula:**
```
milliseconds = seconds × 1000
1 hour = 60 × 60 × 1000 = 3600000
```

### Email Configuration (Optional)

```env
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@taskflow.com
```

**Options:**

- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
  - `587` - TLS (recommended)
  - `465` - SSL
  - `25` - Unencrypted (not recommended)
- `SMTP_USER`: Email account username
- `SMTP_PASS`: Email account password or app-specific password
- `SMTP_FROM`: Sender email address for outgoing emails

**Provider-Specific Configuration:**

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@taskflow.com
```

**Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password (not your regular password)

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

#### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

**Development Mode:**
If SMTP is not configured, password reset emails will be logged to the console instead of being sent. This is useful for development and testing.

For detailed email setup instructions, see [Email Setup Guide](./email-setup.md).

### Frontend Configuration

```env
# Frontend URL for password reset links
FRONTEND_URL=http://localhost:3000
```

**Options:**

- `FRONTEND_URL`: URL of your frontend application
  - Used in password reset email links
  - Should point to your password reset page

**Examples:**

```env
# Development
FRONTEND_URL=http://localhost:3000

# Production
FRONTEND_URL=https://app.taskflow.com

# Custom port
FRONTEND_URL=http://localhost:8080
```

The password reset email will contain a link like:
```
{FRONTEND_URL}/reset-password?token={reset_token}
```

## Complete Configuration Examples

### Development Environment

```env
# Database
DB_NAME=taskflow-dev.db
DATABASE_URL="file:./${DB_NAME}"

# Server
PORT=3000
PUBLIC_URL=

# JWT
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRATION=7d

# Password Reset
RESET_TOKEN_EXPIRATION=3600000

# Email (optional in dev - will log to console)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=dev@example.com
# SMTP_PASS=dev-password
# SMTP_FROM=noreply@taskflow.com

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Production Environment

```env
# Database
DB_NAME=taskflow.db
DATABASE_URL="file:./${DB_NAME}"

# Server
PORT=3000
PUBLIC_URL=https://api.taskflow.com

# JWT
JWT_SECRET="<GENERATE-SECURE-32-CHAR-SECRET>"
JWT_EXPIRATION=7d

# Password Reset
RESET_TOKEN_EXPIRATION=3600000

# Email (required in production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<SENDGRID-API-KEY>
SMTP_FROM=noreply@taskflow.com

# Frontend
FRONTEND_URL=https://app.taskflow.com
```

### Testing Environment

```env
# Database
DB_NAME=taskflow-test.db
DATABASE_URL="file:./${DB_NAME}"

# Server
PORT=3001
PUBLIC_URL=

# JWT
JWT_SECRET="test-secret-key"
JWT_EXPIRATION=1h

# Password Reset
RESET_TOKEN_EXPIRATION=1800000

# Email (disabled for tests)
# Leave commented out

# Frontend
FRONTEND_URL=http://localhost:3001
```

## Environment-Specific Files

For managing multiple environments, you can create separate `.env` files:

```bash
.env                 # Default/Development
.env.development    # Development
.env.production     # Production
.env.test           # Testing
.env.staging        # Staging
```

Load specific environment:

```bash
# Development
npm run dev

# Production (when using PM2)
npm run deploy
```

## Security Best Practices

### 1. Never Commit `.env` Files

Ensure `.env` is in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.*.local
```

### 2. Use Strong Secrets

- JWT_SECRET: At least 32 random characters
- SMTP_PASS: Use app-specific passwords, not account passwords
- Rotate secrets regularly

### 3. Environment Separation

- Use different secrets for each environment
- Never use production credentials in development
- Store production secrets securely (e.g., AWS Secrets Manager, HashiCorp Vault)

### 4. Validation

The application validates required environment variables on startup. Missing critical variables will cause the server to fail to start with a clear error message.

## Troubleshooting

### Environment Variables Not Loading

If your `.env` file isn't being read:

1. Verify the file is named exactly `.env` (not `.env.txt`)
2. Check the file is in the project root directory
3. Ensure `dotenv` is properly configured in `server.ts`
4. Restart the server after changing `.env`

### JWT Token Errors

If you get JWT verification errors:
- Ensure `JWT_SECRET` hasn't changed
- Check `JWT_EXPIRATION` format is valid
- Verify tokens weren't generated with a different secret

### Email Not Sending

If emails aren't being sent:
1. Verify all SMTP settings are correct
2. Check SMTP credentials are valid
3. Ensure firewall allows outbound connections on SMTP_PORT
4. For Gmail, verify you're using an app password
5. Check server logs for error messages

### Database Connection Issues

If database connection fails:
1. Verify `DATABASE_URL` format is correct
2. Check write permissions in the project directory
3. Ensure `DB_NAME` doesn't contain invalid characters
4. Run `npx prisma generate` after changing database settings

## Reference

- [Getting Started](./getting-started.md) - Initial setup guide
- [Email Setup](./email-setup.md) - Detailed email configuration
- [Deployment](./deployment.md) - Production deployment guide
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
