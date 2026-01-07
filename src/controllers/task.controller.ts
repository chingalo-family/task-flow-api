import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { status, priority } = req.query;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        status: status ? String(status) : undefined,
        priority: priority ? String(priority) : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// Helper to parse/stringify JSON fields if needed, but Prisma handles strings. 
// We are storing tags/attachments as JSON strings.

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { dueDate, tags, attachments, subtasks, ...otherData } = req.body;
    
    const task = await prisma.task.create({
      data: {
        ...otherData,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId: userId,
        tags: tags ? JSON.stringify(tags) : '[]',
        attachments: attachments ? JSON.stringify(attachments) : '[]',
        subtasks: subtasks ? {
            create: subtasks.map((s: any) => ({
                title: s.title,
                status: s.isCompleted ? 'COMPLETED' : 'PENDING',
                userId: userId, // Subtasks need an owner
                tags: '[]',
                attachments: '[]'
            }))
        } : undefined
      },
      include: { subtasks: true }
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: { subtasks: true }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { dueDate, tags, attachments, subtasks, ...otherData } = req.body;

    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
          ...otherData,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          tags: tags ? JSON.stringify(tags) : undefined,
          attachments: attachments ? JSON.stringify(attachments) : undefined,
          // Note: Subtask update logic is complex (add/remove/update). 
          // For simplicity here, we assume client handles subtasks separately or replcaes them.
          // Or we can simple ignore subtasks here if handled via specific endpoints, 
          // but for now let's leave subtasks out of direct update or just create new ones not delete old ones.
      },
      include: { subtasks: true }
    });

    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
