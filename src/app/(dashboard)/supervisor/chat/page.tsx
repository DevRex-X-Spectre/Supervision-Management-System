import Link from "next/link";
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
import { Avatar } from "@/components/ui/avatar";
import { fullName } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function SupervisorChatPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; student?: string }>;
}) {
  const user = await requireUser(["SUPERVISOR"]);
  const params = await searchParams;

  let activeId = params.c;
  if (!activeId && params.student) {
    const conv = await getOrCreateConversation(params.student);
    activeId = conv.id;
  }

  const conversations = await listConversationsForUser();
  const students = await prisma.user.findMany({
    where: { assignedSupervisorId: user.id, role: "STUDENT", status: "ACTIVE" },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });

  const active = activeId ? await getMessages(activeId) : null;
  const peer = conversations.find((c) => c.id === activeId)?.other;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Messages"
        description="Communicate with assigned students and project coordinators."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {students.map((s) => (
          <Link
            key={s.id}
            href={`/supervisor/chat?student=${s.id}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {fullName(s.firstName, s.lastName)}
          </Link>
        ))}
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start a chat with one of your assigned students."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-2">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/supervisor/chat?c=${c.id}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50 ${
                  c.id === activeId ? "bg-naub-green-soft" : ""
                }`}
              >
                <Avatar firstName={c.other.firstName} lastName={c.other.lastName} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
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
              description="Choose a student conversation to continue."
            />
          )}
        </div>
      )}
    </div>
  );
}
