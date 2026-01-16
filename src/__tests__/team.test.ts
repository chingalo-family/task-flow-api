import request from 'supertest';
import { app } from '../server';
import { prisma as prismaMock } from '../utils/prisma';
import jwt from 'jsonwebtoken';

jest.mock('../utils/prisma');

const JWT_SECRET = "mmieqkskjbfwqhrw";

describe('Team Endpoints', () => {
  const mockUserId = 'user-1';
  const mockToken = jwt.sign({ userId: mockUserId }, JWT_SECRET);

  describe('GET /api/teams', () => {
    it('should return all teams with all fields', async () => {
      const mockTeams = [
        {
          id: 'team-1',
          name: 'Team One',
          description: 'Description One',
          icon: '🚀',
          color: '#ff0000',
          avatarUrl: 'icon-url',
          customTaskStatuses: '["to-do", "doing", "done"]',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId } as any);
      (prismaMock.team.findMany as jest.Mock).mockResolvedValue(mockTeams as any);

      const res = await request(app)
        .get('/api/teams')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.teams[0]).toHaveProperty('icon', '🚀');
      expect(res.body.teams[0]).toHaveProperty('color', '#ff0000');
    });
  });

  describe('POST /api/teams', () => {
    it('should create a new team with all fields', async () => {
      const newTeam = {
        name: 'Full Team',
        description: 'Full Description',
        icon: '💼',
        color: '#00ff00',
        avatarUrl: 'avatar-url'
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId } as any);
      (prismaMock.team.create as jest.Mock).mockResolvedValue({
        id: 'team-new-id',
        ...newTeam,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(newTeam);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.team.name).toBe(newTeam.name);
      expect(res.body.team.icon).toBe(newTeam.icon);
    });
  });
});
