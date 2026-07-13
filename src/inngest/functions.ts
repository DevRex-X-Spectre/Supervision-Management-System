import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

/** Daily job: remind students about deadlines within 48 hours or overdue */
export const deadlineReminders = inngest.createFunction(
  { id: "deadline-reminders", name: "Deadline reminders" },
  { cron: "0 8 * * *" },
  async ({ step }) => {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const deadlines = await step.run("load-deadlines", async () => {
      return prisma.deadline.findMany({
        where: {
          dueAt: { lte: in48h },
          projectId: { not: null },
        },
        include: {
          project: { select: { studentId: true, title: true } },
        },
        take: 200,
      });
    });

    let sent = 0;
    for (const d of deadlines) {
      if (!d.project?.studentId) continue;
      const overdue = d.dueAt < now;
      await step.run(`notify-${d.id}`, async () => {
        await createNotification({
          userId: d.project!.studentId,
          type: "DEADLINE",
          title: overdue ? "Overdue research deadline" : "Upcoming research deadline",
          body: overdue
            ? `"${d.title}" was due on ${d.dueAt.toLocaleDateString()}. Please submit or contact your supervisor.`
            : `"${d.title}" is due on ${d.dueAt.toLocaleDateString()}. Stay on track with your research plan.`,
          link: "/student/project",
          relatedEntityType: "Deadline",
          relatedEntityId: d.id,
          email: true,
        });
      });
      sent += 1;
    }

    // Mark overdue milestones
    await step.run("mark-overdue-milestones", async () => {
      await prisma.projectMilestone.updateMany({
        where: {
          dueDate: { lt: now },
          status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
        },
        data: { status: "OVERDUE" },
      });
    });

    return { sent, checked: deadlines.length };
  }
);

/** Weekly digest for supervisors with pending reviews */
export const supervisorPendingDigest = inngest.createFunction(
  { id: "supervisor-pending-digest", name: "Supervisor pending review digest" },
  { cron: "0 9 * * 1" },
  async ({ step }) => {
    const supervisors = await step.run("load-supervisors", async () => {
      return prisma.user.findMany({
        where: { role: "SUPERVISOR", status: "ACTIVE" },
        select: { id: true, firstName: true },
      });
    });

    let sent = 0;
    for (const s of supervisors) {
      const pending = await prisma.submission.count({
        where: { status: "PENDING", project: { supervisorId: s.id } },
      });
      if (pending === 0) continue;
      await createNotification({
        userId: s.id,
        type: "SYSTEM",
        title: "Weekly pending reviews",
        body: `You have ${pending} research submission${pending === 1 ? "" : "s"} awaiting feedback.`,
        link: "/supervisor/reviews",
        email: true,
      });
      sent += 1;
    }

    return { sent };
  }
);

export const inngestFunctions = [deadlineReminders, supervisorPendingDigest];
