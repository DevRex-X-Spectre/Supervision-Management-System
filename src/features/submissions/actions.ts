"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { submissionSchema, feedbackSchema } from "@/lib/validations/submission";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import type { ActionResult } from "@/types";

export async function createSubmissionAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser(["STUDENT"]);

  let files: unknown[] = [];
  const filesRaw = formData.get("files");
  if (typeof filesRaw === "string" && filesRaw) {
    try {
      files = JSON.parse(filesRaw);
    } catch {
      return { success: false, error: "Invalid file payload." };
    }
  }

  const parsed = submissionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    milestoneId: formData.get("milestoneId") || null,
    files,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the form errors.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const project = await prisma.researchProject.findUnique({
    where: { studentId: user.id },
  });

  if (!project) {
    return {
      success: false,
      error: "You need an active research project before submitting progress. Contact your coordinator.",
    };
  }

  if (!project.supervisorId) {
    return {
      success: false,
      error: "No supervisor is assigned to your project yet. Submissions will open after assignment.",
    };
  }

  // Version per milestone or general stream
  const versionCount = await prisma.submission.count({
    where: {
      studentId: user.id,
      milestoneId: parsed.data.milestoneId ?? undefined,
      title: parsed.data.milestoneId ? undefined : parsed.data.title,
    },
  });

  const submission = await prisma.submission.create({
    data: {
      projectId: project.id,
      studentId: user.id,
      milestoneId: parsed.data.milestoneId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      status: "PENDING",
      version: versionCount + 1,
      files: {
        create: (parsed.data.files ?? []).map((f) => ({
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileKey: f.fileKey,
          fileSize: f.fileSize,
          mimeType: f.mimeType,
        })),
      },
    },
  });

  if (parsed.data.milestoneId) {
    await prisma.projectMilestone.update({
      where: { id: parsed.data.milestoneId },
      data: { status: "SUBMITTED" },
    });
  }

  await createNotification({
    userId: project.supervisorId,
    type: "SUBMISSION",
    title: "New research progress submitted",
    body: `${user.firstName} ${user.lastName} submitted "${parsed.data.title}" for review.`,
    link: `/supervisor/reviews/${submission.id}`,
    relatedEntityType: "Submission",
    relatedEntityId: submission.id,
  });

  await writeAuditLog({
    actorId: user.id,
    action: "SUBMISSION_CREATED",
    entityType: "Submission",
    entityId: submission.id,
    metadata: { title: submission.title, projectId: project.id },
  });

  revalidatePath("/student");
  revalidatePath("/student/submissions");
  revalidatePath("/supervisor");
  revalidatePath("/supervisor/reviews");

  return { success: true, data: { id: submission.id }, message: "Progress submitted for review." };
}

export async function submitFeedbackAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser(["SUPERVISOR"]);

  const parsed = feedbackSchema.safeParse({
    submissionId: formData.get("submissionId"),
    comment: formData.get("comment"),
    decision: formData.get("decision"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Please provide a decision and meaningful feedback.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const submission = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
    include: { project: true, student: true },
  });

  if (!submission) {
    return { success: false, error: "Submission not found." };
  }

  if (submission.project.supervisorId !== user.id) {
    return { success: false, error: "You can only review submissions from your assigned students." };
  }

  await prisma.$transaction([
    prisma.feedback.create({
      data: {
        submissionId: submission.id,
        supervisorId: user.id,
        comment: parsed.data.comment,
        decision: parsed.data.decision,
      },
    }),
    prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: parsed.data.decision,
        reviewedAt: new Date(),
      },
    }),
  ]);

  if (submission.milestoneId) {
    const nextStatus =
      parsed.data.decision === "APPROVED"
        ? "APPROVED"
        : parsed.data.decision === "NEEDS_REVISION"
          ? "IN_PROGRESS"
          : "IN_PROGRESS";
    await prisma.projectMilestone.update({
      where: { id: submission.milestoneId },
      data: { status: nextStatus },
    });
  }

  await createNotification({
    userId: submission.studentId,
    type: "FEEDBACK",
    title: "Supervisor feedback received",
    body: `Your submission "${submission.title}" was marked as ${parsed.data.decision.replaceAll("_", " ").toLowerCase()}.`,
    link: `/student/submissions/${submission.id}`,
    relatedEntityType: "Submission",
    relatedEntityId: submission.id,
  });

  await writeAuditLog({
    actorId: user.id,
    action: "FEEDBACK_SUBMITTED",
    entityType: "Submission",
    entityId: submission.id,
    metadata: { decision: parsed.data.decision },
  });

  revalidatePath("/supervisor/reviews");
  revalidatePath(`/supervisor/reviews/${submission.id}`);
  revalidatePath("/student/submissions");
  revalidatePath(`/student/submissions/${submission.id}`);
  revalidatePath("/student");
  revalidatePath("/supervisor");

  return { success: true, message: "Feedback saved and the student has been notified." };
}

/** Coordinator may see metadata only, never file URLs or full document content */
export async function getSubmissionForUser(submissionId: string) {
  const user = await requireUser();

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          matricNumber: true,
          department: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
          supervisorId: true,
          supervisor: {
            select: { id: true, firstName: true, lastName: true, title: true },
          },
        },
      },
      milestone: true,
      files: true,
      feedback: {
        include: {
          supervisor: {
            select: { id: true, firstName: true, lastName: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!submission) return null;

  if (user.role === "STUDENT" && submission.studentId !== user.id) return null;
  if (user.role === "SUPERVISOR" && submission.project.supervisorId !== user.id) return null;

  if (user.role === "COORDINATOR") {
    // Strip file URLs and feedback text for privacy; keep high-level metadata
    return {
      ...submission,
      description: "[Hidden from coordinator view]",
      files: submission.files.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        fileSize: f.fileSize,
        mimeType: f.mimeType,
        fileUrl: "",
        fileKey: "",
        createdAt: f.createdAt,
      })),
      feedback: submission.feedback.map((f) => ({
        ...f,
        comment: "[Feedback content restricted]",
      })),
      _restricted: true as const,
    };
  }

  return { ...submission, _restricted: false as const };
}
