import { z } from 'zod';

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
        isCompleted: z.boolean().default(false)
    })).optional(),
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
    projectId: z.string().optional(),
    projectName: z.string().optional(),
  }),
});
