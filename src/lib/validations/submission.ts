import { z } from "zod";

export const submissionSchema = z.object({
  title: z.string().min(3, "Title is required").max(200),
  description: z.string().min(10, "Provide a short summary of your progress").max(10000),
  milestoneId: z.string().cuid().optional().nullable(),
  files: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileKey: z.string(),
        fileSize: z.number().int().positive().max(10 * 1024 * 1024),
        mimeType: z.string(),
      })
    )
    .max(5, "You may attach up to 5 files")
    .optional()
    .default([]),
});

export const feedbackSchema = z.object({
  submissionId: z.string().cuid(),
  comment: z.string().min(5, "Feedback comment is required").max(10000),
  decision: z.enum(["APPROVED", "REJECTED", "NEEDS_REVISION"]),
});
