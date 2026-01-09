# Deployment Guide

This guide covers deploying Task Flow API to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [PM2 Deployment](#pm2-deployment)
3. [Manual Deployment](#manual-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)
6. [SSL/HTTPS Setup](#sslhttps-setup)
7. [Monitoring](#monitoring)
8. [Backup Strategy](#backup-strategy)
9. [Scaling](#scaling)

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` in `.env`
- [ ] Configure SMTP settings for email
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Set `PUBLIC_URL` for Swagger documentation
- [ ] Test all API endpoints
- [ ] Run database migrations
- [ ] Set up SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set up monitoring
- [ ] Plan backup strategy
- [ ] Review security settings

---

## PM2 Deployment

PM2 is the recommended production process manager.

### Automated Deployment

The easiest way to deploy with PM2:

```bash
# One-command deployment
npm run deploy
# or
./deploy.sh
```

This script will:
1. Install dependencies
2. Generate Prisma Client
3. Run database migrations
4. Build TypeScript code
5. Start with PM2 in cluster mode
6. Configure PM2 to start on system boot

### Manual PM2 Deployment

If you prefer manual deployment:

```bash
# 1. Install dependencies
npm install --production=false

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. Build the application
npm run build

# 5. Start with PM2
npm run pm2:start
```

### PM2 Configuration

The application uses `ecosystem.config.js` for PM2 configuration:

```javascript
module.exports = {
  apps: [{
    name: 'task-flow-api',
    script: './dist/server.js',
    instances: 'max',           // Use all CPU cores
    exec_mode: 'cluster',       // Enable cluster mode
    env_production: {
      NODE_ENV: 'production',
    },
    max_memory_restart: '1G',   // Auto-restart if memory exceeds 1GB
    min_uptime: '10s',          // Minimum uptime before considering stable
    max_restarts: 10,           // Maximum restart attempts
    autorestart: true,          // Auto-restart on crash
    watch: false,               // Disable file watching in production
    merge_logs: true,           // Merge cluster logs
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
```

### PM2 Management Commands

```bash
# Start application
npm run pm2:start
# or
pm2 start ecosystem.config.js --env production

# Stop application
npm run pm2:stop
# or
pm2 stop task-flow-api

# Restart application
npm run pm2:restart
# or
pm2 restart task-flow-api

# Reload (zero-downtime restart)
pm2 reload task-flow-api

# View logs
npm run pm2:logs
# or
pm2 logs task-flow-api

# Monitor resources
npm run pm2:monit
# or
pm2 monit

# View status
pm2 status

# View detailed info
pm2 describe task-flow-api
```

### PM2 Startup Script

Configure PM2 to start on system boot:

```bash
# Generate startup script
pm2 startup

# Save current PM2 process list
pm2 save

# Now PM2 will auto-start on reboot
```

For detailed PM2 configuration, see [PM2 Guide](./deployment-pm2.md).

---

## Manual Deployment

### Without PM2

If you prefer not to use PM2:

```bash
# 1. Setup
cp .env.sample .env
# Edit .env with production settings

# 2. Install dependencies
npm install --production

# 3. Database setup
npx prisma generate
npx prisma migrate deploy

# 4. Build
npm run build

# 5. Start
npm start
```

**Note:** This runs a single process without auto-restart or clustering.

### Using systemd (Linux)

Create a systemd service for auto-restart:

```bash
sudo nano /etc/systemd/system/task-flow-api.service
```

```ini
[Unit]
Description=Task Flow API
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/task-flow-api
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=task-flow-api

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable task-flow-api
sudo systemctl start task-flow-api
sudo systemctl status task-flow-api
```

---

## Cloud Deployment

### Deploy to DigitalOcean

**1. Create Droplet:**
- Ubuntu 20.04 or later
- At least 1GB RAM
- SSH access configured

**2. Setup Server:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Clone repository
git clone https://github.com/chingalo-family/task-flow-api.git
cd task-flow-api

# Deploy
./deploy.sh
```

**3. Configure Firewall:**

```bash
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp
sudo ufw enable
```

**4. Setup Nginx (Optional):**

See [SSL/HTTPS Setup](#sslhttps-setup) below.

### Deploy to AWS EC2

Similar to DigitalOcean, but:

1. Launch EC2 instance (Ubuntu)
2. Configure security groups (allow port 3000)
3. SSH into instance
4. Follow same setup steps

### Deploy to Heroku

```bash
# 1. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create task-flow-api

# 4. Set buildpack
heroku buildpacks:set heroku/nodejs

# 5. Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set DATABASE_URL=your-db-url

# 6. Deploy
git push heroku main

# 7. Run migrations
heroku run npx prisma migrate deploy
```

**Note:** Heroku filesystem is ephemeral. Use PostgreSQL instead of SQLite.

### Deploy to Vercel

Task Flow API can be deployed to Vercel as a serverless function:

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Configure environment variables in Vercel dashboard
4. Deploy with `vercel --prod`

**Note:** Consider database limitations with serverless deployments.

---

## Environment Configuration

### Production .env

```env
# Database
DB_NAME=taskflow.db
DATABASE_URL="file:./${DB_NAME}"

# Server
PORT=3000
PUBLIC_URL=https://api.yourdomain.com

# JWT
JWT_SECRET="<GENERATE-SECURE-32-CHAR-SECRET>"
JWT_EXPIRATION=7d

# Password Reset
RESET_TOKEN_EXPIRATION=3600000

# Email (Required in Production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<SENDGRID-API-KEY>
SMTP_FROM=noreply@yourdomain.com

# Frontend
FRONTEND_URL=https://app.yourdomain.com
```

### Generating Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

### Environment Variables Management

**Option 1: .env file**
- Keep .env on server
- Never commit to Git
- Use `.env.production` for production settings

**Option 2: Environment Variables**
```bash
export JWT_SECRET="your-secret"
export DATABASE_URL="your-db-url"
```

**Option 3: Secret Management Service**
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

---

## SSL/HTTPS Setup

### Using Nginx as Reverse Proxy

**1. Install Nginx:**

```bash
sudo apt install nginx
```

**2. Configure Nginx:**

```bash
sudo nano /etc/nginx/sites-available/task-flow-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**3. Enable Site:**

```bash
sudo ln -s /etc/nginx/sites-available/task-flow-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**4. Install SSL Certificate (Let's Encrypt):**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

**5. Update Firewall:**

```bash
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 3000/tcp
```

Now your API is accessible via `https://api.yourdomain.com`

---

## Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs

# Check status
pm2 status

# View detailed metrics
pm2 describe task-flow-api
```

### PM2 Plus (Advanced Monitoring)

```bash
# Link to PM2 Plus
pm2 link <secret> <public>

# Features:
# - Real-time monitoring dashboard
# - Exception tracking
# - Custom metrics
# - Alerting
```

### Log Management

Logs are stored in `logs/` directory:

```bash
# View error logs
tail -f logs/err.log

# View output logs
tail -f logs/out.log

# Rotate logs (setup logrotate)
sudo nano /etc/logrotate.d/task-flow-api
```

```
/path/to/task-flow-api/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

### Health Check Endpoint

Add a health check endpoint (recommended):

```typescript
// src/server.ts
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

Monitor with:
```bash
curl https://api.yourdomain.com/health
```

---

## Backup Strategy

### Database Backup

**Automated Daily Backup:**

```bash
# Create backup script
nano ~/backup-taskflow.sh
```

```bash
#!/bin/bash
BACKUP_DIR=~/backups/taskflow
DB_FILE=/path/to/task-flow-api/taskflow.db
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_FILE $BACKUP_DIR/taskflow_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "taskflow_*.db" -mtime +30 -delete

echo "Backup completed: taskflow_$DATE.db"
```

```bash
chmod +x ~/backup-taskflow.sh
```

**Schedule with Cron:**

```bash
crontab -e
```

Add:
```
0 2 * * * ~/backup-taskflow.sh
```

This runs daily at 2 AM.

### Offsite Backup

Upload backups to cloud storage:

```bash
# AWS S3
aws s3 cp taskflow.db s3://your-bucket/backups/

# DigitalOcean Spaces
s3cmd put taskflow.db s3://your-space/backups/
```

---

## Scaling

### Vertical Scaling

Increase server resources:
- More CPU cores (PM2 will use them automatically)
- More RAM
- Faster storage (SSD)

### Horizontal Scaling

**Load Balancer Setup:**

```
     Load Balancer
    /      |      \
Server1  Server2  Server3
    \      |      /
    Shared Database
```

**Requirements:**
- Migrate from SQLite to PostgreSQL
- Shared database server
- Session management (JWT is stateless, so no issue)

### Database Scaling

**Migrate to PostgreSQL:**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
```

```bash
npx prisma migrate dev
```

---

## Security Hardening

### Server Security

```bash
# Keep system updated
sudo apt update && sudo apt upgrade

# Configure firewall
sudo ufw enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh

# Install fail2ban
sudo apt install fail2ban
```

### Application Security

- Use HTTPS (SSL)
- Set strong JWT_SECRET
- Enable Helmet middleware (already configured)
- Validate all inputs (already configured with Zod)
- Keep dependencies updated
- Use environment variables for secrets
- Enable CORS only for trusted domains

### CORS Configuration

Update CORS for production:

```typescript
// src/server.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

---

## Troubleshooting Deployment

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
kill -9 <PID>
```

### PM2 Not Starting

```bash
# Check logs
pm2 logs

# Delete and restart
pm2 delete task-flow-api
pm2 start ecosystem.config.js --env production
```

### Database Migration Errors

```bash
# Check migration status
npx prisma migrate status

# Deploy pending migrations
npx prisma migrate deploy

# If needed, reset (⚠️ deletes data)
npx prisma migrate reset
```

### Out of Memory

```bash
# Increase PM2 memory limit
# Edit ecosystem.config.js
max_memory_restart: '2G'

# Or reduce instances
instances: 2
```

For more troubleshooting, see [Troubleshooting Guide](./troubleshooting.md).

---

## Post-Deployment

### Verify Deployment

1. **Check API Health:**
   ```bash
   curl https://api.yourdomain.com/api-docs
   ```

2. **Test Authentication:**
   ```bash
   curl -X POST https://api.yourdomain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@example.com","password":"pass123"}'
   ```

3. **Monitor Logs:**
   ```bash
   pm2 logs
   ```

4. **Check Process Status:**
   ```bash
   pm2 status
   ```

### Documentation

- Update PUBLIC_URL in `.env` for Swagger docs
- Document your production URL
- Share API documentation link with frontend team

---

## Related Documentation

- [Getting Started](./getting-started.md)
- [Configuration](./configuration.md)
- [PM2 Guide](./deployment-pm2.md)
- [Email Setup](./email-setup.md)
- [Troubleshooting](./troubleshooting.md)
