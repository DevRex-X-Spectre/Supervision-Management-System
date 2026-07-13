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

export const messageSchema = z.object({
  conversationId: z.string().cuid().optional(),
  recipientId: z.string().cuid(),
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

export const announcementSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(10).max(10000),
  isActive: z.boolean().optional().default(true),
});
