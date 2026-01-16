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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 teams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *             example:
 *               success: true
 *               teams:
 *                 - id: "550e8400-e29b-41d4-a716-446655440005"
 *                   name: "App Development"
 *                   description: "Core app team"
 *                   icon: "🚀"
 *                   color: "#4A90E2"
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
 *             $ref: '#/components/schemas/CreateTeamRequest'
 *           example:
 *             name: "Marketing"
 *             description: "Global marketing team"
 *             icon: "📢"
 *             color: "#E24A90"
 *     responses:
 *       201:
 *         description: Team created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 team:
 *                   $ref: '#/components/schemas/Team'
 *             example:
 *               success: true
 *               team:
 *                 id: "550e8400-e29b-41d4-a716-446655440006"
 *                 name: "Marketing"
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
 *         description: Team details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 team:
 *                   $ref: '#/components/schemas/Team'
 *             example:
 *               success: true
 *               team:
 *                 id: "550e8400-e29b-41d4-a716-446655440005"
 *                 name: "App Development"
 *                 members:
 *                   - id: "member-uuid"
 *                     role: "ADMIN"
 *                     user: { id: "user-uuid", name: "John Doe" }
 */
router.get('/:id', getTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update team
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
 *             $ref: '#/components/schemas/UpdateTeamRequest'
 *           example:
 *             name: "Updated Team Name"
 *     responses:
 *       200:
 *         description: Team updated
 *       403:
 *         description: Forbidden - ADMIN role required
 */
router.put('/:id', validate(updateTeamSchema), updateTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete team
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
 */
router.delete('/:id', deleteTeam);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   post:
 *     summary: Add team member
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
 *           example:
 *             userId: "user-uuid-to-add"
 *             role: "MEMBER"
 *     responses:
 *       201:
 *         description: Member added
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               member: { id: "new-member-uuid", role: "MEMBER" }
 */
router.post('/:id/members', validate(addMemberSchema), addMember);

/**
 * @swagger
 * /api/teams/{id}/members/{userId}:
 *   delete:
 *     summary: Remove team member
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
 */
router.delete('/:id/members/:userId', removeMember);

export default router;
