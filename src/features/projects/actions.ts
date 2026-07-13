"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  deadlineSchema,
  milestoneSchema,
  milestoneTemplateSchema,
  projectSchema,
} from "@/lib/validations/project";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import type { ActionResult } from "@/types";

export async function upsertProjectAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser(["STUDENT"]);
  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    topic: formData.get("topic") || undefined,
    abstract: formData.get("abstract") || undefined,
    sessionYear: formData.get("sessionYear") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: "Please provide a valid project title and details." };
  }

  const existing = await prisma.researchProject.findUnique({
    where: { studentId: user.id },
  });

  if (existing) {
    await prisma.researchProject.update({
      where: { id: existing.id },
      data: {
        ...parsed.data,
        supervisorId: user.assignedSupervisorId,
      },
    });
  } else {
    const project = await prisma.researchProject.create({
      data: {
        ...parsed.data,
        studentId: user.id,
        supervisorId: user.assignedSupervisorId,
        status: "ACTIVE",
        startDate: new Date(),
      },
    });

    const templates = await prisma.milestoneTemplate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (templates.length) {
      await prisma.projectMilestone.createMany({
        data: templates.map((t, index) => ({
          projectId: project.id,
          templateId: t.id,
          title: t.name,
          description: t.description,
          sortOrder: t.sortOrder,
          status: index === 0 ? "IN_PROGRESS" : "NOT_STARTED",
          dueDate: t.defaultDays
            ? new Date(Date.now() + t.defaultDays * 24 * 60 * 60 * 1000)
            : null,
        })),
      });
    }
  }

  await writeAuditLog({
    actorId: user.id,
    action: existing ? "PROJECT_UPDATED" : "PROJECT_CREATED",
    entityType: "ResearchProject",
    entityId: existing?.id,
    metadata: { title: parsed.data.title },
  });

  revalidatePath("/student/project");
  revalidatePath("/student");
  return { success: true, message: "Research project saved." };
}

export async function createCustomMilestoneAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser(["SUPERVISOR", "COORDINATOR"]);
  const parsed = milestoneSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || null,
    projectId: formData.get("projectId"),
    sortOrder: formData.get("sortOrder") || 99,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid milestone details." };
  }

  const project = await prisma.researchProject.findUnique({
    where: { id: parsed.data.projectId },
  });
  if (!project) return { success: false, error: "Project not found." };

  if (user.role === "SUPERVISOR" && project.supervisorId !== user.id) {
    return { success: false, error: "You can only manage milestones for your students." };
  }

  const milestone = await prisma.projectMilestone.create({
    data: {
      projectId: project.id,
      title: parsed.data.title,
      description: parsed.data.description,
      sortOrder: parsed.data.sortOrder ?? 99,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      status: "NOT_STARTED",
      isCustom: true,
    },
  });

  await createNotification({
    userId: project.studentId,
    type: "DEADLINE",
    title: "New milestone added",
    body: `A new milestone "${milestone.title}" was added to your research plan.`,
    link: "/student/project",
  });

  revalidatePath("/student/project");
  revalidatePath("/supervisor/students");
  revalidatePath("/coordinator/projects");
  return { success: true, message: "Milestone created." };
}

export async function createDeadlineAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser(["SUPERVISOR", "COORDINATOR"]);
  const parsed = deadlineSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    dueAt: formData.get("dueAt"),
    projectId: formData.get("projectId") || null,
    milestoneId: formData.get("milestoneId") || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Provide a title and due date." };
  }

  if (parsed.data.projectId && user.role === "SUPERVISOR") {
    const project = await prisma.researchProject.findUnique({
      where: { id: parsed.data.projectId },
    });
    if (!project || project.supervisorId !== user.id) {
      return { success: false, error: "You can only set deadlines for your assigned students." };
    }
  }

  const deadline = await prisma.deadline.create({
    data: {
      title: parsed.data.title,
      notes: parsed.data.notes,
      dueAt: new Date(parsed.data.dueAt),
      projectId: parsed.data.projectId || null,
      milestoneId: parsed.data.milestoneId || null,
      setById: user.id,
    },
  });

  if (parsed.data.milestoneId && parsed.data.dueAt) {
    await prisma.projectMilestone.update({
      where: { id: parsed.data.milestoneId },
      data: { dueDate: new Date(parsed.data.dueAt) },
    });
  }

  if (parsed.data.projectId) {
    const project = await prisma.researchProject.findUnique({
      where: { id: parsed.data.projectId },
    });
    if (project) {
      await createNotification({
        userId: project.studentId,
        type: "DEADLINE",
        title: "New deadline set",
        body: `"${deadline.title}" is due on ${new Date(deadline.dueAt).toLocaleDateString()}.`,
        link: "/student/project",
      });
    }
  }

  await writeAuditLog({
    actorId: user.id,
    action: "DEADLINE_CREATED",
    entityType: "Deadline",
    entityId: deadline.id,
  });

  revalidatePath("/supervisor/deadlines");
  revalidatePath("/student/project");
  revalidatePath("/coordinator");
  return { success: true, message: "Deadline saved." };
}

export async function saveMilestoneTemplateAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireUser(["COORDINATOR"]);
  const parsed = milestoneTemplateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
    defaultDays: formData.get("defaultDays") || null,
    isActive: formData.get("isActive") !== "false",
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid template data." };
  }

  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await prisma.milestoneTemplate.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        sortOrder: parsed.data.sortOrder,
        defaultDays: parsed.data.defaultDays ?? null,
        isActive: parsed.data.isActive ?? true,
      },
    });
  } else {
    await prisma.milestoneTemplate.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        sortOrder: parsed.data.sortOrder,
        defaultDays: parsed.data.defaultDays ?? null,
        isActive: parsed.data.isActive ?? true,
      },
    });
  }

  revalidatePath("/coordinator/milestones");
  return { success: true, message: "Milestone template saved." };
}
