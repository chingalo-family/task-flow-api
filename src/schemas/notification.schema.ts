import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1), // Added title
    content: z.string().min(1),
    type: z.string().min(1),
    userId: z.string().uuid(),
    relatedEntityId: z.string().optional(),
    relatedEntityType: z.string().optional(),
  }),
});
