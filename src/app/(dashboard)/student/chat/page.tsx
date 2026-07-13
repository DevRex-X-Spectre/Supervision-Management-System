import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  getMessages,
  getOrCreateConversation,
  listConversationsForUser,
} from "@/features/chat/actions";
import { PageHeader } from "@/components/ui/page-header";
import { ChatPanel } from "@/components/shared/chat-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { fullName } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export const metadata = { title: "Messages" };

export default async function StudentChatPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const user = await requireUser(["STUDENT"]);
  const params = await searchParams;

  const student = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      assignedSupervisorId: true,
      assignedSupervisor: {
        select: { id: true, firstName: true, lastName: true, title: true, role: true },
      },
    },
  });

  // Ensure conversation with supervisor exists for convenience
  let activeId = params.c;
  if (!activeId && student?.assignedSupervisorId) {
    const conv = await getOrCreateConversation(student.assignedSupervisorId);
    activeId = conv.id;
  }

  const conversations = await listConversationsForUser();
  const active = activeId ? await getMessages(activeId) : null;
  const peer =
    active && active.conversation.participantAId === user.id
      ? conversations.find((c) => c.id === activeId)?.other
      : conversations.find((c) => c.id === activeId)?.other;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Messages"
        description="Chat with your assigned supervisor or project coordinator."
      />

      {!student?.assignedSupervisorId ? (
        <EmptyState
          icon={MessageSquare}
          title="No supervisor assigned"
          description="Messaging opens after a project coordinator assigns your supervisor."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-2">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/student/chat?c=${c.id}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50 ${
                  c.id === activeId ? "bg-naub-green-soft" : ""
                }`}
              >
                <Avatar firstName={c.other.firstName} lastName={c.other.lastName} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {fullName(c.other.firstName, c.other.lastName, c.other.title)}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {c.lastMessage?.content ?? "No messages yet"}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {active && peer ? (
            <ChatPanel
              conversationId={active.conversation.id}
              recipientId={peer.id}
              currentUserId={user.id}
              peer={peer}
              initialMessages={active.messages}
            />
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the list to continue messaging."
            />
          )}
        </div>
      )}
    </div>
  );
}
