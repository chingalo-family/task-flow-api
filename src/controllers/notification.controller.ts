import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        await prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true }
        });

        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        res.json({ success: true, message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const createNotification = async (req: Request, res: Response) => {
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
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await prisma.notification.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
