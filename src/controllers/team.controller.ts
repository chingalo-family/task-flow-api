import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, icon, color } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
        throw new ApiError(401, 'Unauthorized');
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        icon,
        color,
        members: {
          create: {
            userId: userId!,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
            include: { user: { select: { id: true, name: true, avatar: true, email: true } } }
        }
      }
    });

    res.status(201).json({ success: true, team });
  } catch (error) {
    next(error);
  }
};

export const getTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
          _count: { select: { members: true, tasks: true } }
      }
    });

    res.json({ success: true, teams });
  } catch (error) {
    next(error);
  }
};

export const getTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const team = await prisma.team.findFirst({
      where: {
        id,
        members: { some: { userId } },
      },
      include: {
        members: {
           include: { user: { select: { id: true, name: true, avatar: true, email: true } } }
        },
        tasks: {
            take: 5,
            orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!team) {
      throw new ApiError(404, 'Team not found');
    }

    res.json({ success: true, team });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const data = req.body;

        // Check if admin
        const member = await prisma.teamMember.findFirst({
            where: { teamId: id, userId, role: 'ADMIN' }
        });

        if (!member) {
            throw new ApiError(403, 'Not authorized. Admin role required.');
        }

        const team = await prisma.team.update({
            where: { id },
            data,
        });

        res.json({ success: true, team });
    } catch (error) {
        next(error);
    }
};

export const deleteTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        // Check if admin
        const member = await prisma.teamMember.findFirst({
            where: { teamId: id, userId, role: 'ADMIN' }
        });

        if (!member) {
            throw new ApiError(403, 'Not authorized. Admin role required.');
        }

        await prisma.team.delete({ where: { id } });

        res.json({ success: true, message: 'Team deleted' });
    } catch (error) {
        next(error);
    }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.body;
        const currentUserId = (req as any).user?.id;

         // Check if requester is admin
         const member = await prisma.teamMember.findFirst({
            where: { teamId: id, userId: currentUserId, role: 'ADMIN' }
        });

        if (!member) {
            throw new ApiError(403, 'Not authorized. Admin role required.');
        }

        const newMember = await prisma.teamMember.create({
            data: {
                teamId: id,
                userId,
                role: role || 'MEMBER'
            },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
        });

        res.status(201).json({ success: true, member: newMember });

    } catch (error) {
        next(error);
    }
}

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, userId } = req.params;
        const currentUserId = (req as any).user?.id;

         // Check if requester is admin
         const member = await prisma.teamMember.findFirst({
            where: { teamId: id, userId: currentUserId, role: 'ADMIN' }
        });

        if (!member) {
            throw new ApiError(403, 'Not authorized. Admin role required.');
        }

        await prisma.teamMember.deleteMany({
            where: { teamId: id, userId }
        });

        res.json({ success: true, message: 'Member removed' });

    } catch (error) {
        next(error);
    }
}

