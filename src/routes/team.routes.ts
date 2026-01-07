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

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team collaboration and management
 */

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams user is a member of
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teams
 */
router.get('/', getTeams);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created (creator is auto-added as ADMIN)
 */
router.post('/', validate(createTeamSchema), createTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team details
 *     tags: [Teams]
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
 *         description: Team details with members and recent tasks
 *       404:
 *         description: Team not found
 */
router.get('/:id', getTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update team (ADMIN only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated
 *       403:
 *         description: Not authorized (requires ADMIN role)
 */
router.put('/:id', validate(updateTeamSchema), updateTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete team (ADMIN only)
 *     tags: [Teams]
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
 *         description: Team deleted
 *       403:
 *         description: Not authorized (requires ADMIN role)
 */
router.delete('/:id', deleteTeam);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   post:
 *     summary: Add member to team (ADMIN only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *     responses:
 *       201:
 *         description: Member added
 *       403:
 *         description: Not authorized
 */
router.post('/:id/members', validate(addMemberSchema), addMember);

/**
 * @swagger
 * /api/teams/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from team (ADMIN only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 *       403:
 *         description: Not authorized
 */
router.delete('/:id/members/:userId', removeMember);

export default router;
