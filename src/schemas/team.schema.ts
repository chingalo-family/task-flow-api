import { z } from 'zod';

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
