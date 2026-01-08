import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, avatar, email } = req.body;
    const userId = req.user?.id;

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, avatar, email },
      select: { id: true, email: true, name: true, avatar: true },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } },
        { username: { contains: String(search) } },
      ];
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where: whereClause,
            take: limit,
            skip: skip,
            select: { 
                id: true, 
                name: true, 
                email: true, 
                username: true,
                phoneNumber: true,
                avatar: true,
                createdAt: true,
            },
        }),
        prisma.user.count({ where: whereClause })
    ]);

    res.json({ 
        success: true, 
        users,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
