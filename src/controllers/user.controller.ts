import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user?.id },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, avatar, email } = req.body;
    const userId = (req as any).user?.id;

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        throw new ApiError(400, 'Email already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, avatar, email },
      select: { id: true, email: true, name: true, avatar: true },
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
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
    next(error);
  }
};

