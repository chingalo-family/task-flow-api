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

router.get('/', getNotifications);
router.post('/', validate(createNotificationSchema), createNotification);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.put('/read-all', markAllAsRead);

export default router;
