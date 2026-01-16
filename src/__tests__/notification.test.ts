import request from 'supertest';
import { app } from '../server';
import { prisma as prismaMock } from '../utils/prisma';
import jwt from 'jsonwebtoken';

jest.mock('../utils/prisma');

const JWT_SECRET = "mmieqkskjbfwqhrw";

describe('Notification Endpoints', () => {
  const mockUserId = 'user-1';
  const mockToken = jwt.sign({ userId: mockUserId }, JWT_SECRET);

  describe('GET /api/notifications', () => {
    it('should return user notifications with all fields', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          title: 'New Task Assignment',
          content: 'You were assigned to Task 1',
          type: 'task_assignment',
          isRead: false,
          relatedEntityId: 'task-1',
          relatedEntityType: 'task',
          actorUserId: 'user-2',
          actorUsername: 'actoruser',
          actorAvatarUrl: 'actor-avatar',
          createdAt: new Date(),
          userId: mockUserId
        }
      ];

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId } as any);
      (prismaMock.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications as any);

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.notifications[0]).toHaveProperty('title', 'New Task Assignment');
      expect(res.body.notifications[0]).toHaveProperty('actorUsername', 'actoruser');
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId } as any);
      (prismaMock.notification.findFirst as jest.Mock).mockResolvedValue({ id: 'notif-1', userId: mockUserId } as any);
      (prismaMock.notification.update as jest.Mock).mockResolvedValue({ id: 'notif-1', isRead: true } as any);

      const res = await request(app)
        .put('/api/notifications/notif-1/read')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
