import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';

const transformTask = (task: any) => ({
    ...task,
    tags: task.tags ? JSON.parse(task.tags) : [],
    attachments: task.attachments ? JSON.parse(task.attachments) : [],
    assignedUserIds: task.assignees?.map((u: any) => u.id) || [],
    subtasks: task.subtasks?.map((s: any) => ({
        ...s,
        isCompleted: s.status === 'completed'
    })) || []
});

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority } = req.query;
    const userId = (req as any).user?.id;

    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {
        userId,
        status: status ? String(status) : undefined,
        priority: priority ? String(priority) : undefined,
    };

    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: { subtasks: true, assignees: true }
        }),
        prisma.task.count({ where })
    ]);

    const transformedTasks = tasks.map(transformTask);

    res.status(200).json({ 
        success: true, 
        tasks: transformedTasks,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }
    
    const { dueDate, tags, attachments, subtasks, assignedUserIds, ...otherData } = req.body;
    
    const task = await prisma.task.create({
      data: {
        ...otherData,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId: userId,
        tags: tags ? JSON.stringify(tags) : '[]',
        attachments: attachments ? JSON.stringify(attachments) : '[]',
        assignees: assignedUserIds ? {
            connect: assignedUserIds.map((id: string) => ({ id }))
        } : undefined,
        subtasks: subtasks ? {
            create: subtasks.map((s: any) => ({
                title: s.title,
                status: s.isCompleted ? 'completed' : 'pending',
                userId: userId,
                tags: '[]',
                attachments: '[]'
            }))
        } : undefined
      },
      include: { subtasks: true, assignees: true }
    });

    res.status(201).json({ success: true, task: transformTask(task) });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: { subtasks: true, assignees: true }
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    res.status(200).json({ success: true, task: transformTask(task) });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { dueDate, tags, attachments, subtasks, assignedUserIds, ...otherData } = req.body;

    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
          ...otherData,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          tags: tags ? JSON.stringify(tags) : undefined,
          attachments: attachments ? JSON.stringify(attachments) : undefined,
          assignees: assignedUserIds ? {
             set: assignedUserIds.map((id: string) => ({ id }))
          } : undefined,
      },
      include: { subtasks: true, assignees: true }
    });

    res.status(200).json({ success: true, task: transformTask(updatedTask) });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    await prisma.task.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

