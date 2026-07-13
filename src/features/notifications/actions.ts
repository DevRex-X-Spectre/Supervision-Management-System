"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { announcementSchema } from "@/lib/validations/users";
import { createNotifications, createNotification } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit";
import { withDatabaseFallback } from "@/lib/db-error";
import type { ActionResult } from "@/types";

export async function markNotificationReadAction(notificationId: string): Promise<ActionResult> {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { readAt: new Date() },
  });
  revalidatePath(`/${user.role.toLowerCase()}/notifications`);
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath(`/${user.role.toLowerCase()}/notifications`);
  return { success: true, message: "All notifications marked as read." };
}

export async function createAnnouncementAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser(["COORDINATOR"]);
  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    isActive: formData.get("isActive") !== "false",
  });

  if (!parsed.success) {
    return { success: false, error: "Provide a clear title and announcement body." };
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      isActive: parsed.data.isActive ?? true,
      createdById: user.id,
    },
  });

  const recipients = await prisma.user.findMany({
    where: { status: "ACTIVE", role: { in: ["STUDENT", "SUPERVISOR"] } },
    select: { id: true, role: true },
  });

  await createNotifications(
    recipients.map((r) => ({
      userId: r.id,
      type: "ANNOUNCEMENT" as const,
      title: announcement.title,
      body: announcement.body.slice(0, 240),
      link: r.role === "SUPERVISOR" ? "/supervisor" : "/student",
      relatedEntityType: "Announcement",
      relatedEntityId: announcement.id,
      email: true,
    }))
  );

  await writeAuditLog({
    actorId: user.id,
    action: "ANNOUNCEMENT_CREATED",
    entityType: "Announcement",
    entityId: announcement.id,
  });

  revalidatePath("/coordinator/announcements");
  revalidatePath("/student");
  revalidatePath("/supervisor");
  return { success: true, message: "Announcement published and users notified." };
}

export async function getUnreadCount() {
  const user = await requireUser();
  return withDatabaseFallback(
    () =>
      prisma.notification.count({
        where: { userId: user.id, readAt: null },
      }),
    0,
    `getUnreadCount:${user.id}`
  );
}
