import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(250),
  topic: z.string().max(150).optional(),
  abstract: z.string().max(5000).optional(),
  sessionYear: z.string().max(20).optional(),
});

export const milestoneSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().cuid(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const deadlineSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  notes: z.string().max(2000).optional(),
  dueAt: z.string().min(1, "Due date is required"),
  projectId: z.string().cuid().optional().nullable(),
  milestoneId: z.string().cuid().optional().nullable(),
});

export const milestoneTemplateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  sortOrder: z.coerce.number().int().min(0),
  defaultDays: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});
