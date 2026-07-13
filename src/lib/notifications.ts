import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher-server";
import { sendNotificationEmail } from "@/lib/email";

type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  email?: boolean;
};

export async function createNotification(input: NotifyInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
    },
  });

  try {
    await pusherServer.trigger(`private-user-${input.userId}`, "notification", {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      link: notification.link,
      createdAt: notification.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Pusher notification failed", error);
  }

  if (input.email !== false) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true, firstName: true },
    });
    if (user) {
      void sendNotificationEmail({
        to: user.email,
        firstName: user.firstName,
        title: input.title,
        body: input.body,
        link: input.link,
      });
    }
  }

  return notification;
}

export async function createNotifications(inputs: NotifyInput[]) {
  return Promise.all(inputs.map((i) => createNotification(i)));
}
