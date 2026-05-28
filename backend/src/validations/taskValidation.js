import { z } from 'zod';

const statusSchema = z.enum(['pending', 'in-progress', 'done']);

const deadlineSchema = z
  .string()
  .trim()
  .min(1, 'Deadline is required')
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: 'Deadline must be a valid date',
  });

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  status: statusSchema.default('pending'),
  deadline: deadlineSchema,
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').optional(),
    description: z.string().trim().min(1, 'Description is required').optional(),
    status: statusSchema.optional(),
    deadline: deadlineSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });

export const getZodErrorMessage = (error) => {
  return error.issues[0]?.message || 'Invalid input';
};