import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { unreadOnly } = req.query;

    const whereClause: any = { userId };
    if (unreadOnly === 'true') {
        whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        await prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true }
        });

        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        res.json({ success: true, message: 'All marked as read' });
    } catch (error) {
        next(error);
    }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { content, type, userId } = req.body;

        const notification = await prisma.notification.create({
            data: {
                content,
                type,
                userId,
                isRead: false
            }
        });

        res.status(201).json({ success: true, notification });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) {
            throw new ApiError(404, 'Notification not found');
        }

        await prisma.notification.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
};

