import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color } = req.body;
    const userId = req.user?.id;

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
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

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
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const data = req.body;

        // Check if admin
        const member = await prisma.teamMember.findFirst({
            where: { teamId: id, userId, role: 'ADMIN' }
        });

        if (!member) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const team = await prisma.team.update({
            where: { id },
            data,
        });

        res.json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteTeam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Check if admin
        const member = await prisma.teamMember.findFirst({
            where: { teamId: id, userId, role: 'ADMIN' }
        });

        if (!member) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await prisma.team.delete({ where: { id } });

        res.json({ success: true, message: 'Team deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const addMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.body;
        const currentUserId = req.user?.id;

         // Check if requester is admin
         const member = await prisma.teamMember.findFirst({
            where: { teamId: id, userId: currentUserId, role: 'ADMIN' }
        });

        if (!member) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
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
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const removeMember = async (req: Request, res: Response) => {
    try {
        const { id, userId } = req.params;
        const currentUserId = req.user?.id;

         // Check if requester is admin
         const member = await prisma.teamMember.findFirst({
            where: { teamId: id, userId: currentUserId, role: 'ADMIN' }
        });

        if (!member) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await prisma.teamMember.deleteMany({
            where: { teamId: id, userId }
        });

        res.json({ success: true, message: 'Member removed' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
