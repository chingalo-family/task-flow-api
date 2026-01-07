import { Router } from 'express';
import {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember
} from '../controllers/team.controller';
import { validate } from '../utils/validate';
import { createTeamSchema, updateTeamSchema, addMemberSchema } from '../schemas/team.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTeams);
router.post('/', validate(createTeamSchema), createTeam);
router.get('/:id', getTeam);
router.put('/:id', validate(updateTeamSchema), updateTeam);
router.delete('/:id', deleteTeam);
router.post('/:id/members', validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
