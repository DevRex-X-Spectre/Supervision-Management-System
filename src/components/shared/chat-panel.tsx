"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { sendMessageAction } from "@/features/chat/actions";
import { getPusherClient } from "@/lib/pusher-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { formatDateTime, fullName, cn } from "@/lib/utils";
import { Send } from "lucide-react";

type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string | Date;
  readAt?: string | Date | null;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    title?: string | null;
  };
};

type Peer = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  role?: string;
};

export function ChatPanel({
  conversationId,
  recipientId,
  currentUserId,
  peer,
  initialMessages,
}: {
  conversationId: string;
  recipientId: string;
  currentUserId: string;
  peer: Peer;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher || !conversationId) return;

    const channel = pusher.subscribe(`private-conversation-${conversationId}`);
    const handler = (data: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    };
    channel.bind("new-message", handler);

    return () => {
      channel.unbind("new-message", handler);
      pusher.unsubscribe(`private-conversation-${conversationId}`);
    };
  }, [conversationId]);

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    const formData = new FormData();
    formData.set("conversationId", conversationId);
    formData.set("recipientId", recipientId);
    formData.set("content", content.trim());
    const optimistic = content.trim();
    setContent("");

    startTransition(async () => {
      const result = await sendMessageAction(null, formData);
      if (!result.success) {
        setContent(optimistic);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Avatar firstName={peer.firstName} lastName={peer.lastName} />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {fullName(peer.firstName, peer.lastName, peer.title)}
          </p>
          <p className="text-xs text-slate-500">Secure academic conversation</p>
        </div>
      </div>

      <div className="chat-scroll flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-4 py-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            No messages yet. Start the conversation with a clear academic question or update.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[70%]",
                    mine
                      ? "rounded-br-md bg-naub-green text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-white/70" : "text-slate-400"
                    )}
                  >
                    {formatDateTime(m.createdAt)}
                    {mine && m.readAt ? " · Read" : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSend} className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a professional message..."
            className="min-h-[52px] resize-none"
            rows={2}
          />
          <Button type="submit" disabled={pending || !content.trim()} className="shrink-0 self-end">
            <Send className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
