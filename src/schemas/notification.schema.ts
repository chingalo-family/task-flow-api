import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         title:
 *           type: string
 *           example: "New Task Assigned"
 *         content:
 *           type: string
 *           example: "You have been assigned to the task: 'Design New Dashboard'."
 *         type:
 *           type: string
 *           example: "TASK_ASSIGNED"
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T10:00:00Z"
 *     CreateNotificationRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - type
 *         - userId
 *       properties:
 *         title:
 *           type: string
 *           example: "Team Invitation"
 *         content:
 *           type: string
 *           example: "John Doe invited you to join 'Engineering Team'."
 *         type:
 *           type: string
 *           example: "TEAM_INVITE"
 *         userId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         relatedEntityId:
 *           type: string
 *           example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
 *         relatedEntityType:
 *           type: string
 *           example: "TEAM"
 */
export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1), // Added title
    content: z.string().min(1),
    type: z.string().min(1),
    userId: z.string().uuid(),
    relatedEntityId: z.string().optional(),
    relatedEntityType: z.string().optional(),
  }),
});
