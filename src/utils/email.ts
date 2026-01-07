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
  
  // Build reset URL (update with your actual frontend URL)
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@taskflow.com',
    to: email,
    subject: 'Password Reset Request - Task Flow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2E90FA; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="margin-top: 30px; color: #999; font-size: 12px;">
          This link will expire in 1 hour.<br>
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    text: `
Password Reset Request

You requested to reset your password. Click the link below to reset it:
${resetUrl}

This link will expire in 1 hour.
If you didn't request this, please ignore this email.
    `,
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
