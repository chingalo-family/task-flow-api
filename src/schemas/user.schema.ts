import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           example: "https://example.com/avatar.jpg"
 *         phoneNumber:
 *           type: string
 *           example: "+1234567890"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T10:00:00Z"
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           example: "https://example.com/avatar.jpg"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         phoneNumber:
 *           type: string
 *           example: "+1234567890"
 */
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    avatar: z.string().optional(),
    email: z.string().email().optional(),
    username: z.string().min(3).optional(),
    phoneNumber: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6),
  }),
});
