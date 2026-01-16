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
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         phoneNumber:
 *           type: string
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
