import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
 *         name:
 *           type: string
 *           example: "Engineering Team"
 *         description:
 *           type: string
 *           example: "Development and maintenance of the Task Flow platform."
 *         icon:
 *           type: string
 *           example: "code"
 *         color:
 *           type: string
 *           example: "#3498db"
 *         customTaskStatuses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "todo"
 *               name:
 *                 type: string
 *                 example: "To Do"
 *               color:
 *                 type: string
 *                 example: "#95a5a6"
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T10:00:00Z"
 *     CreateTeamRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Marketing Squad"
 *         description:
 *           type: string
 *           example: "Focused on growth and brand awareness."
 *         icon:
 *           type: string
 *           example: "megaphone"
 *         color:
 *           type: string
 *           example: "#e67e22"
 *         customTaskStatuses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "todo"
 *               name:
 *                 type: string
 *                 example: "To Do"
 *               color:
 *                 type: string
 *                 example: "#95a5a6"
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     UpdateTeamRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Global Engineering Team"
 *         description:
 *           type: string
 *           example: "Updated description for the team."
 *         icon:
 *           type: string
 *           example: "globe"
 *         color:
 *           type: string
 *           example: "#2ecc71"
 *         customTaskStatuses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "review"
 *               name:
 *                 type: string
 *                 example: "Under Review"
 *               color:
 *                 type: string
 *                 example: "#f1c40f"
 *               isDefault:
 *                 type: boolean
 *                 example: false
 */
export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    customTaskStatuses: z.array(z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        isDefault: z.boolean()
    })).optional(),
  }),
});

export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    customTaskStatuses: z.array(z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        isDefault: z.boolean()
    })).optional(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    role: z.enum(['ADMIN', 'MEMBER']).optional(),
  }),
});
