# Email Configuration Guide for Password Reset

## Quick Setup

The forgot password feature is already implemented but needs email configuration to send reset links.

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update `.env` file**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@taskflow.com
FRONTEND_URL=http://localhost:3000
```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up** at https://sendgrid.com
2. **Create API Key** in Settings > API Keys
3. **Update `.env`**:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Option 3: Development Mode (Console Logging)

If you **don't configure SMTP**, password reset emails will be **logged to console** instead of sent.

This is useful for development/testing without email setup.

## Testing Password Reset

### 1. Request Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### 2. Check Email or Console
- **With SMTP**: Check email inbox for reset link
- **Without SMTP**: Check server console for output like:
  ```
  Email preview (dev mode):
  From: noreply@taskflow.com
  To: user@example.com
  Subject: Password Reset Request
  Reset link: http://localhost:3000/reset-password?token=abc123...
  ```

### 3. Reset Password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "TOKEN_FROM_EMAIL", "newPassword": "newpass123"}'
```

## Current Status

✅ Password reset API endpoints are working
✅ Email templates are ready
❌ SMTP configuration needed to send emails

**To enable email sending, update `.env` with your SMTP settings and restart the server.**

## Troubleshooting

**"Failed to send password reset email"** - Check:
1. SMTP credentials are correct
2. SMTP_PORT is correct (587 for TLS, 465 for SSL)
3. Firewall allows outbound SMTP connections
4. Gmail: App password is used (not regular password)

**No email received** - Check:
1. Spam/junk folder
2. Email address is correct in database
3. Server logs for errors
