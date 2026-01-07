import nodemailer from 'nodemailer';

// Configure email transporter
// For development, you can use ethereal.email (fake SMTP)
// For production, use Gmail, SendGrid, etc.
const createTransporter = () => {
  // Check if we have SMTP config in environment
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to console logging for development
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const transporter = createTransporter();
  
  // Build reset URL pointing to HTML reset page
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;
  
  // HTML Email Template matching website design
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1A2332; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #243447; border-radius: 12px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .header { background-color: #243447; padding: 30px; text-align: center; border-bottom: 1px solid #374151; }
        .logo { font-size: 24px; font-weight: bold; color: #2E90FA; text-decoration: none; }
        .content { padding: 40px 30px; color: #FFFFFF; text-align: center; }
        .button { display: inline-block; padding: 14px 28px; background-color: #2E90FA; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; transition: background-color 0.3s; }
        .button:hover { background-color: #1a73e8; }
        .footer { background-color: #1A2332; padding: 20px; text-align: center; color: #94A3B8; font-size: 12px; border-top: 1px solid #374151; }
        h1 { margin-bottom: 16px; font-size: 24px; }
        p { color: #94A3B8; line-height: 1.6; margin-bottom: 24px; font-size: 16px; }
        .link { color: #2E90FA; word-break: break-all; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="#" class="logo">Task Flow</a>
        </div>
        <div class="content">
          <h1>Reset Your Password</h1>
          <p>We received a request to reset your password for your Task Flow account. If you didn't make this request, just ignore this email.</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p style="margin-top: 30px; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <a href="${resetUrl}" class="link">${resetUrl}</a>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Task Flow. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@taskflow.com',
    to: email,
    subject: 'Password Reset Request - Task Flow',
    html: htmlContent,
    text: htmlContent.replace(/<[^>]*>/g, '')
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    // If using stream transport (dev), log the message
    if (info.messageId) {
      console.log('Email preview (dev mode):');
      console.log(info.messageId);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send password reset email');
  }
  };
        
