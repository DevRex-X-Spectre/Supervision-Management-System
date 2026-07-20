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

function conversationTypeFor(roleA: string, roleB: string): ConversationType {
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

  let files: unknown[] = [];
  const filesRaw = formData.get("files");
  if (typeof filesRaw === "string" && filesRaw) {
    try {
      files = JSON.parse(filesRaw);
    } catch {
      return { success: false, error: "Invalid document attachment." };
    }
  }

  const parsed = messageSchema.safeParse({
    conversationId: formData.get("conversationId") || undefined,
    recipientId: formData.get("recipientId"),
    content: formData.get("content") ?? "",
    files,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Write a message or attach a document.",
    };
  }

  // Document attachments only for student and supervisor chat participants
  if ((parsed.data.files?.length ?? 0) > 0) {
    if (user.role !== "STUDENT" && user.role !== "SUPERVISOR") {
      return { success: false, error: "Only students and supervisors can attach documents in chat." };
    }
  }

  const allowed = await canMessage(user.id, parsed.data.recipientId);
  if (!allowed.ok) return { success: false, error: allowed.reason };

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

  const text = parsed.data.content?.trim() ?? "";
  const fileList = parsed.data.files ?? [];

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content: text || (fileList.length ? "Shared a document" : ""),
      files: {
        create: fileList.map((f) => ({
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileKey: f.fileKey,
          fileSize: f.fileSize,
          mimeType: f.mimeType,
        })),
      },
    },
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, role: true, title: true },
      },
      files: true,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: message.createdAt },
  });

  const payload = {
    id: message.id,
    conversationId,
    content: message.content,
    senderId: message.senderId,
    createdAt: message.createdAt.toISOString(),
    sender: message.sender,
    readAt: null as string | null,
    files: message.files.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
      fileKey: f.fileKey,
      fileSize: f.fileSize,
      mimeType: f.mimeType,
    })),
  };

  try {
    await pusherServer.trigger(`private-conversation-${conversationId}`, "new-message", payload);
  } catch (error) {
    console.error("Pusher message trigger failed", error);
  }

  const hasDocs = fileList.length > 0;
  await createNotification({
    userId: parsed.data.recipientId,
    type: "MESSAGE",
    title: hasDocs ? "New message with document" : "New message",
    body: hasDocs
      ? `${user.firstName} ${user.lastName} shared a document in chat.`
      : `${user.firstName} ${user.lastName} sent you a message.`,
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
          files: { select: { id: true, fileName: true }, take: 1 },
        },
      },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  });

  return conversations.map((c) => {
    const other = c.participantAId === user.id ? c.participantB : c.participantA;
    const last = c.messages[0] ?? null;
    return {
      id: c.id,
      type: c.type,
      other,
      lastMessage: last
        ? {
            ...last,
            content:
              last.content ||
              (last.files?.length ? `Document: ${last.files[0].fileName}` : ""),
          }
        : null,
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

  if (
    conversation.participantAId !== user.id &&
    conversation.participantBId !== user.id
  ) {
    return null;
  }

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
      files: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileKey: true,
          fileSize: true,
          mimeType: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return { conversation, messages };
}
