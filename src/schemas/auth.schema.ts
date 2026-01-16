import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *         name:
 *           type: string
 *           example: "John Doe"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: "johndoe"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         expiresIn:
 *           type: integer
 *           example: 3600
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: "123e4567-e89b-12d3-a456-426614174000"
 *             username:
 *               type: string
 *               example: "johndoe"
 *             email:
 *               type: string
 *               format: email
 *               example: "user@example.com"
 */
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
    username: z.string().min(3),
    phoneNumber: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1),
    password: z.string(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6),
  }),
});
