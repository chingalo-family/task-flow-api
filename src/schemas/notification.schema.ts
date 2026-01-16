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
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         type:
 *           type: string
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
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
 *         content:
 *           type: string
 *         type:
 *           type: string
 *         userId:
 *           type: string
 *           format: uuid
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
