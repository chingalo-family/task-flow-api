import request from 'supertest';
import { app } from '../server';
import { prisma as prismaMock } from '../utils/prisma';
import jwt from 'jsonwebtoken';

jest.mock('../utils/prisma');

const JWT_SECRET = "mmieqkskjbfwqhrw";

describe('Task Endpoints', () => {
  const mockUserId = 'user-1';
  const mockToken = jwt.sign({ userId: mockUserId }, JWT_SECRET);

  describe('GET /api/tasks', () => {
    it('should return all tasks for the user with all fields', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          priority: 'medium',
          category: 'work',
          progress: 10,
          remindMe: true,
          tags: '["tag1"]',
          attachments: '["file1.pdf"]',
          dueDate: new Date(),
          projectId: 'project-1',
          projectName: 'Project One',
          userId: mockUserId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId } as any);
      (prismaMock.task.findMany as jest.Mock).mockResolvedValue(mockTasks as any);
      (prismaMock.task.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.tasks[0]).toHaveProperty('description', 'Description 1');
      expect(res.body.tasks[0]).toHaveProperty('category', 'work');
      expect(res.body.tasks[0]).toHaveProperty('progress', 10);
      expect(res.body.tasks[0]).toHaveProperty('remindMe', true);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with all supported fields', async () => {
      const newTask = {
        title: 'New Comprehensive Task',
        description: 'Detailed Description',
        status: 'in_progress',
        priority: 'high',
        category: 'personal',
        progress: 50,
        remindMe: true,
        tags: ['important', 'urgent'],
        attachments: ['img.png'],
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        projectId: 'project-uuid',
        projectName: 'My Project'
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId } as any);
      (prismaMock.task.create as jest.Mock).mockResolvedValue({
        id: 'task-new-id',
        ...newTask,
        tags: JSON.stringify(newTask.tags),
        attachments: JSON.stringify(newTask.attachments),
        dueDate: new Date(newTask.dueDate),
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        subtasks: [],
        assignees: []
      } as any);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(newTask);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.task.title).toBe(newTask.title);
      expect(res.body.task.category).toBe(newTask.category);
      expect(res.body.task.projectName).toBe(newTask.projectName);
    });
  });
});
