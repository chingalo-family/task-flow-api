import { Router } from 'express';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { validate } from '../utils/validate';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: List tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by task priority
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of tasks with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *             example:
 *               success: true
 *               tasks:
 *                 - id: "550e8400-e29b-41d4-a716-446655440000"
 *                   title: "Finish API documentation"
 *                   description: "Update swagger with examples"
 *                   status: "in_progress"
 *                   priority: "high"
 *                   progress: 50
 *                   tags: ["api", "docs"]
 *                   createdAt: "2026-01-14T12:00:00Z"
 *               meta:
 *                 total: 1
 *                 page: 1
 *                 limit: 20
 *                 totalPages: 1
 */
router.get('/', getTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *           example:
 *             title: "Investigate performance bottleneck"
 *             description: "Profile the API and identify slow queries"
 *             status: "pending"
 *             priority: "urgent"
 *             tags: ["performance", "backend"]
 *             dueDate: "2026-01-20T00:00:00Z"
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *             example:
 *               success: true
 *               task:
 *                 id: "550e8400-e29b-41d4-a716-446655440001"
 *                 title: "Investigate performance bottleneck"
 *                 status: "pending"
 *                 priority: "urgent"
 *                 createdAt: "2026-01-14T12:05:00Z"
 */
router.post('/', validate(createTaskSchema), createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
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
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *             example:
 *               success: true
 *               task:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 title: "Finish API documentation"
 *                 status: "in_progress"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Task not found"
 */
router.get('/:id', getTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
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
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *           example:
 *             status: "completed"
 *             progress: 100
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *             example:
 *               success: true
 *               task:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 status: "completed"
 *                 progress: 100
 */
router.put('/:id', validate(updateTaskSchema), updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
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
 *         description: Task deleted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Task deleted"
 */
router.delete('/:id', deleteTask);

export default router;
