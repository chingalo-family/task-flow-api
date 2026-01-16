import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         dueDate:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         progress:
 *           type: integer
 */
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate: z.string().datetime().optional(),
    teamId: z.string().uuid().optional(),
    category: z.string().optional(),
    remindMe: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    attachments: z.array(z.string()).optional(),
    subtasks: z.array(z.object({
        title: z.string().min(1),
        isCompleted: z.boolean().default(false).optional(),
        status: z.string().optional() // Allow status pass-through if needed
    })).optional(),
    assignedUserIds: z.array(z.string().uuid()).optional(),
    projectId: z.string().optional(),
    projectName: z.string().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate: z.string().datetime().optional(),
    teamId: z.string().uuid().optional(),
    category: z.string().optional(),
    remindMe: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    attachments: z.array(z.string()).optional(),
    progress: z.number().min(0).max(100).optional(),
    assignedUserIds: z.array(z.string().uuid()).optional(),
    projectId: z.string().optional(),
    projectName: z.string().optional(),
  }),
});
