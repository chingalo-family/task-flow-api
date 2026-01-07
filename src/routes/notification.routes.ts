import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
} from '../controllers/notification.controller';
import { validate } from '../utils/validate';
import { createNotificationSchema } from '../schemas/notification.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter to show only unread notifications
 *     responses:
 *       200:
 *         description: List of notifications (max 50)
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - type
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *               userId:
 *                 type: string
 *               relatedEntityId:
 *                 type: string
 *               relatedEntityType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/', validate(createNotificationSchema), createNotification);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.put('/:id/read', markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', deleteNotification);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all', markAllAsRead);

export default router;
