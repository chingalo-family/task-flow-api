import request from 'supertest';
import { app } from '../server';
import { prisma as prismaMock } from '../utils/prisma';
import bcrypt from 'bcrypt';

jest.mock('../utils/prisma');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with all fields', async () => {
      const userData = {
        email: 'full-user@example.com',
        username: 'fulluser',
        password: 'password123',
        name: 'Full Test User',
        phoneNumber: '+1234567890'
      };

      (prismaMock.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaMock.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id-1',
        ...userData,
        password: 'hashedPassword',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).toHaveProperty('name', userData.name);
      expect(res.body.user).toHaveProperty('phoneNumber', userData.phoneNumber);
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password123'
      };

      (prismaMock.user.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-id', ...userData } as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Email or username already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials = {
        username: 'loginuser',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash(credentials.password, 10);

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-login-1',
        email: 'login@example.com',
        username: 'loginuser',
        password: hashedPassword,
        name: 'Login User',
        phoneNumber: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 for invalid credentials', async () => {
      const credentials = {
        username: 'wronguser',
        password: 'wrongpassword'
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
