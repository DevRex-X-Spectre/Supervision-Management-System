"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { messageSchema } from "@/lib/validations/users";
import { createNotification } from "@/lib/notifications";
import { pusherServer } from "@/lib/pusher-server";
import type { ActionResult } from "@/types";
import type { ConversationType } from "@prisma/client";

function orderedPair(a: string, b: string) {
  return a < b ? ([a, b] as const) : ([b, a] as const);
}

function conversationTypeFor(
  roleA: string,
  roleB: string
): ConversationType {
  const roles = new Set([roleA, roleB]);
  if (roles.has("COORDINATOR") && roles.has("STUDENT")) return "COORDINATOR_STUDENT";
  if (roles.has("COORDINATOR") && roles.has("SUPERVISOR")) return "COORDINATOR_SUPERVISOR";
  return "STUDENT_SUPERVISOR";
}

async function canMessage(senderId: string, recipientId: string) {
  const [sender, recipient] = await Promise.all([
    prisma.user.findUnique({ where: { id: senderId } }),
    prisma.user.findUnique({ where: { id: recipientId } }),
  ]);
  if (!sender || !recipient) return { ok: false as const, reason: "User not found." };
  if (sender.status !== "ACTIVE" || recipient.status !== "ACTIVE") {
    return { ok: false as const, reason: "Messaging is only available for active accounts." };
  }

  // Student <-> assigned supervisor
  if (sender.role === "STUDENT" && recipient.role === "SUPERVISOR") {
    if (sender.assignedSupervisorId !== recipient.id) {
      return { ok: false as const, reason: "You can only message your assigned supervisor." };
    }
    return { ok: true as const, sender, recipient };
  }
  if (sender.role === "SUPERVISOR" && recipient.role === "STUDENT") {
    if (recipient.assignedSupervisorId !== sender.id) {
      return { ok: false as const, reason: "You can only message your assigned students." };
    }
    return { ok: true as const, sender, recipient };
  }

  // Coordinator can message any student or supervisor
  if (sender.role === "COORDINATOR" && (recipient.role === "STUDENT" || recipient.role === "SUPERVISOR")) {
    return { ok: true as const, sender, recipient };
  }
  if (recipient.role === "COORDINATOR" && (sender.role === "STUDENT" || sender.role === "SUPERVISOR")) {
    return { ok: true as const, sender, recipient };
  }

  return { ok: false as const, reason: "You are not allowed to message this user." };
}

export async function getOrCreateConversation(recipientId: string) {
  const user = await requireUser();
  const allowed = await canMessage(user.id, recipientId);
  if (!allowed.ok) throw new Error(allowed.reason);

  const [a, b] = orderedPair(user.id, recipientId);
  const type = conversationTypeFor(allowed.sender.role, allowed.recipient.role);

  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participantAId: a, participantBId: b, type },
        { participantAId: b, participantBId: a, type },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participantAId: a,
        participantBId: b,
        type,
      },
    });
  }

  return conversation;
}

export async function sendMessageAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ messageId: string }>> {
  const user = await requireUser();
  const parsed = messageSchema.safeParse({
    conversationId: formData.get("conversationId") || undefined,
    recipientId: formData.get("recipientId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { success: false, error: "Message cannot be empty." };
  }

  const allowed = await canMessage(user.id, parsed.data.recipientId);
  if (!allowed.ok) return { success: false, error: allowed.reason };

  // Coordinators can chat, but other coordinators cannot read chat content of student-supervisor threads.
  // Access control is enforced when loading messages.
  let conversationId = parsed.data.conversationId;
  if (!conversationId) {
    const conversation = await getOrCreateConversation(parsed.data.recipientId);
    conversationId = conversation.id;
  } else {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) return { success: false, error: "Conversation not found." };
    if (
      conversation.participantAId !== user.id &&
      conversation.participantBId !== user.id
    ) {
      return { success: false, error: "You are not a participant in this conversation." };
    }
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content: parsed.data.content.trim(),
    },
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, role: true, title: true },
      },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: message.createdAt },
  });

  try {
    await pusherServer.trigger(`private-conversation-${conversationId}`, "new-message", {
      id: message.id,
      conversationId,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt.toISOString(),
      sender: message.sender,
      readAt: null,
    });
  } catch (error) {
    console.error("Pusher message trigger failed", error);
  }

  await createNotification({
    userId: parsed.data.recipientId,
    type: "MESSAGE",
    title: "New message",
    body: `${user.firstName} ${user.lastName} sent you a message.`,
    link: chatPathFor(allowed.recipient.role, conversationId),
    relatedEntityType: "Conversation",
    relatedEntityId: conversationId,
    email: false,
  });

  revalidatePath("/student/chat");
  revalidatePath("/supervisor/chat");
  revalidatePath("/coordinator");

  return { success: true, data: { messageId: message.id } };
}

function chatPathFor(role: string, conversationId: string) {
  if (role === "STUDENT") return `/student/chat?c=${conversationId}`;
  if (role === "SUPERVISOR") return `/supervisor/chat?c=${conversationId}`;
  return `/coordinator?c=${conversationId}`;
}

export async function listConversationsForUser() {
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participantAId: user.id }, { participantBId: user.id }],
    },
    include: {
      participantA: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          title: true,
          avatarUrl: true,
        },
      },
      participantB: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          title: true,
          avatarUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
          readAt: true,
        },
      },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });

  return conversations.map((c) => {
    const other = c.participantAId === user.id ? c.participantB : c.participantA;
    return {
      id: c.id,
      type: c.type,
      other,
      lastMessage: c.messages[0] ?? null,
      lastMessageAt: c.lastMessageAt,
    };
  });
}

export async function getMessages(conversationId: string) {
  const user = await requireUser();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) return null;

  // Only direct participants may read message content.
  // Coordinators who are not participants cannot inspect student-supervisor chats.
  if (
    conversation.participantAId !== user.id &&
    conversation.participantBId !== user.id
  ) {
    return null;
  }

  // Mark others' messages as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return { conversation, messages };
}
