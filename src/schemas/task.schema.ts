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
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         title:
 *           type: string
 *           example: "Complete Project Proposal"
 *         description:
 *           type: string
 *           example: "Draft and review the technical proposal for the new API."
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *           example: "in_progress"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           example: "high"
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           example: 45
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["work", "priority", "api"]
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T23:59:59Z"
 *         teamId:
 *           type: string
 *           format: uuid
 *           example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
 *         category:
 *           type: string
 *           example: "Frontend"
 *         remindMe:
 *           type: boolean
 *           example: true
 *         subtasks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Wireframes"
 *               isCompleted:
 *                 type: boolean
 *                 example: false
 *         assignedUserIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example: ["123e4567-e89b-12d3-a456-426614174000"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T11:30:00Z"
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: "Design New Dashboard"
 *         description:
 *           type: string
 *           example: "Create mockups and initial UI structure for the dashboard."
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *           example: "pending"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           example: "medium"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T23:59:59Z"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["ui", "design"]
 *         teamId:
 *           type: string
 *           format: uuid
 *           example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
 *         category:
 *           type: string
 *           example: "Frontend"
 *         remindMe:
 *           type: boolean
 *           example: true
 *         subtasks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Wireframes"
 *               isCompleted:
 *                 type: boolean
 *                 example: false
 *         assignedUserIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example: ["123e4567-e89b-12d3-a456-426614174000"]
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated Project Proposal Title"
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *           example: "completed"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           example: "high"
 *         progress:
 *           type: integer
 *           example: 100
 *         description:
 *           type: string
 *           example: "Revised description for the task."
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2024-02-15T09:00:00Z"
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
