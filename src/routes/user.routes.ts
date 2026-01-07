import { Router } from 'express';
import { getProfile, updateProfile, listUsers } from '../controllers/user.controller';
import { validate } from '../utils/validate';
import { updateProfileSchema } from '../schemas/user.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', getProfile);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/me', validate(updateProfileSchema), updateProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or username
 *     responses:
 *       200:
 *         description: List of users with id, email, username, name, phoneNumber, avatar
 */
router.get('/', listUsers);

export default router;
