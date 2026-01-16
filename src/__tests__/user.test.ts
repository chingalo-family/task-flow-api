import request from 'supertest';
import { app } from '../server';
import { prisma as prismaMock } from '../utils/prisma';
import jwt from 'jsonwebtoken';

jest.mock('../utils/prisma');

const JWT_SECRET = "mmieqkskjbfwqhrw";

describe('User Endpoints', () => {
  const mockUserId = 'user-1';
  const mockToken = jwt.sign({ userId: mockUserId }, JWT_SECRET);

  describe('GET /api/users/me', () => {
    it('should return current user profile with all fields', async () => {
      const mockUser = {
        id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        phoneNumber: '+1234567890',
        avatar: 'avatar-url',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser as any);

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe(mockUser.username);
      expect(res.body.user.name).toBe(mockUser.name);
      expect(res.body.user.phoneNumber).toBe(mockUser.phoneNumber);
      expect(res.body.user.avatar).toBe(mockUser.avatar);
    });
  });

  describe('PUT /api/users/me', () => {
    it('should update current user profile fields', async () => {
      const updateData = {
        name: 'Updated Name',
        phoneNumber: '+9876543210',
        avatar: 'new-avatar-url'
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId } as any);
      (prismaMock.user.update as jest.Mock).mockResolvedValue({
        id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        ...updateData,
        updatedAt: new Date()
      } as any);

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe(updateData.name);
      expect(res.body.user.phoneNumber).toBe(updateData.phoneNumber);
      expect(res.body.user.avatar).toBe(updateData.avatar);
    });
  });

  describe('GET /api/users', () => {
    it('should list users with metadata', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'user1', name: 'User One' },
        { id: 'user-2', username: 'user2', name: 'User Two' }
      ];

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId } as any);
      (prismaMock.user.findMany as jest.Mock).mockResolvedValue(mockUsers as any);
      (prismaMock.user.count as jest.Mock).mockResolvedValue(2);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users).toHaveLength(2);
      expect(res.body.meta).toBeDefined();
    });
  });
});
