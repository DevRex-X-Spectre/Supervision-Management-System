import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().max(30).optional().nullable(),
  department: z.string().max(120).optional().nullable(),
  title: z.string().max(40).optional().nullable(),
  specialization: z.string().max(200).optional().nullable(),
});

export const assignSupervisorSchema = z.object({
  studentId: z.string().cuid(),
  supervisorId: z.string().cuid().nullable(),
});

export const updateUserStatusSchema = z.object({
  userId: z.string().cuid(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export const createUserByCoordinatorSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  role: z.enum(["STUDENT", "SUPERVISOR", "COORDINATOR"]),
  department: z.string().min(2).max(120),
  matricNumber: z.string().optional(),
  staffId: z.string().optional(),
  title: z.string().optional(),
  temporaryPassword: z.string().min(8),
});

export const chatFileSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileKey: z.string().min(1),
  fileSize: z.number().int().positive().max(16 * 1024 * 1024),
  mimeType: z.string().min(1),
});

export const messageSchema = z
  .object({
    conversationId: z.string().cuid().optional(),
    recipientId: z.string().cuid(),
    content: z.string().max(5000).optional().default(""),
    files: z.array(chatFileSchema).max(5).optional().default([]),
  })
  .superRefine((data, ctx) => {
    const hasText = Boolean(data.content?.trim());
    const hasFiles = (data.files?.length ?? 0) > 0;
    if (!hasText && !hasFiles) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Write a message or attach a document.",
        path: ["content"],
      });
    }
  });

export const announcementSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(10).max(10000),
  isActive: z.boolean().optional().default(true),
});
