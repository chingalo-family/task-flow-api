import { Router } from 'express';
import { getProfile, updateProfile, listUsers } from '../controllers/user.controller';
import { validate } from '../utils/validate';
import { updateProfileSchema } from '../schemas/user.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', validate(updateProfileSchema), updateProfile);
router.get('/', listUsers);

export default router;
