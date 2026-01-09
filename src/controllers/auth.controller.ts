import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { sendPasswordResetEmail } from '../utils/email';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, username, phoneNumber } = req.body;

    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
        phoneNumber
      },
    });

    const expiresIn = process.env.JWT_EXPIRATION || '7d';
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: expiresIn as any,
    });

    const expirationMs = parseDuration(expiresIn);
    const expiresAt = new Date(Date.now() + expirationMs);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      expiresIn: expirationMs / 1000,
      expiresAt: expiresAt.toISOString(),
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        username: user.username,
        phoneNumber: user.phoneNumber 
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// Helper to parse duration string (e.g., '7d', '24h') to milliseconds
const parseDuration = (duration: string): number => {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7d
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        case 's': return value * 1000;
        default: return 7 * 24 * 60 * 60 * 1000;
    }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const expiresIn = process.env.JWT_EXPIRATION || '7d';
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: expiresIn as any,
    });

    // Calculate absolute expiration time for client convenience
    const expirationMs = parseDuration(expiresIn);
    const expiresAt = new Date(Date.now() + expirationMs);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      expiresIn: expirationMs / 1000, // seconds
      expiresAt: expiresAt.toISOString(),
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        username: user.username,
        phoneNumber: user.phoneNumber 
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        username: true, 
        phoneNumber: true, 
        createdAt: true 
      },
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    // Set expiry based on environment variable (default: 1 hour)
    const expirationMs = parseInt(process.env.RESET_TOKEN_EXPIRATION || '3600000');
    const resetTokenExpiry = new Date(Date.now() + expirationMs);

    // Save hashed token and expiry to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    // Send email with plain token (not hashed)
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // Find users with valid reset tokens
    const users = await prisma.user.findMany({
      where: {
        resetToken: { not: null },
        resetTokenExpiry: { gte: new Date() },
      },
      select: { id: true, email: true, resetToken: true, resetTokenExpiry: true }
    });

    // Find user with matching token
    let validUser = null;
    for (const user of users) {
      if (user.resetToken && await bcrypt.compare(token, user.resetToken)) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    res.status(200).json({
      success: true,
      email: validUser.email,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const users = await prisma.user.findMany({
      where: {
        resetToken: { not: null },
        resetTokenExpiry: { gte: new Date() },
      },
    });

    // Find user with matching token
    let validUser = null;
    for (const user of users) {
      if (user.resetToken && await bcrypt.compare(token, user.resetToken)) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: validUser.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    const expiresIn = process.env.JWT_EXPIRATION || '7d';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
      expiresIn: expiresIn as any,
    });
    const expirationMs = parseDuration(expiresIn);
    const expiresAt = new Date(Date.now() + expirationMs);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
      expiresIn: expirationMs / 1000,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
