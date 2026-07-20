"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { sendMessageAction } from "@/features/chat/actions";
import { getPusherClient } from "@/lib/pusher-client";
import { UploadButton } from "@/lib/uploadthing-components";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { formatDateTime, fullName, cn } from "@/lib/utils";
import { FileText, Paperclip, Send, X } from "lucide-react";

type ChatFile = {
  id?: string;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
};

type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string | Date;
  readAt?: string | Date | null;
  files?: ChatFile[];
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [attachments, setAttachments] = useState<ChatFile[]>([]);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, conversationId]);

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
    if (!content.trim() && attachments.length === 0) return;

    const formData = new FormData();
    formData.set("conversationId", conversationId);
    formData.set("recipientId", recipientId);
    formData.set("content", content.trim());
    formData.set("files", JSON.stringify(attachments));

    const optimisticText = content.trim();
    const optimisticFiles = attachments;
    setContent("");
    setAttachments([]);

    startTransition(async () => {
      const result = await sendMessageAction(null, formData);
      if (!result.success) {
        setContent(optimisticText);
        setAttachments(optimisticFiles);
        toast.error(result.error);
        return;
      }
      // Server revalidate + pusher will add the message; if pusher is offline, refresh list via revalidate
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
          <p className="text-xs text-slate-500">
            Secure academic conversation · PDF and DOCX up to 16 MB
          </p>
        </div>
      </div>

      <div className="chat-scroll flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-4 py-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            No messages yet. Send a message or attach a PDF or DOCX document.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            const files = m.files ?? [];
            const text =
              m.content && m.content !== "Shared a document" ? m.content : "";

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
                  {text ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                  ) : null}

                  {files.length > 0 ? (
                    <ul className={cn("space-y-2", text ? "mt-2" : "")}>
                      {files.map((f) => (
                        <li key={f.fileKey || f.id || f.fileUrl}>
                          <a
                            href={f.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors",
                              mine
                                ? "bg-white/15 text-white hover:bg-white/25"
                                : "border border-slate-200 bg-slate-50 text-naub-green hover:bg-slate-100"
                            )}
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="min-w-0 flex-1 truncate">{f.fileName}</span>
                            <span className={cn("shrink-0", mine ? "text-white/70" : "text-slate-400")}>
                              {formatBytes(f.fileSize)}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {!text && files.length === 0 ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content || "Message"}</p>
                  ) : null}

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
        {attachments.length > 0 ? (
          <ul className="mb-2 space-y-1.5">
            {attachments.map((f) => (
              <li
                key={f.fileKey}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate font-medium text-slate-700">{f.fileName}</span>
                  <span className="shrink-0 text-slate-400">{formatBytes(f.fileSize)}</span>
                </span>
                <button
                  type="button"
                  className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-red-600"
                  onClick={() =>
                    setAttachments((prev) => prev.filter((x) => x.fileKey !== f.fileKey))
                  }
                  aria-label={`Remove ${f.fileName}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-end gap-2">
          <div className="shrink-0">
            <UploadButton
              endpoint="chatDocument"
              onClientUploadComplete={(res) => {
                const next = (res ?? []).map((f) => ({
                  fileName: f.name,
                  fileUrl: f.ufsUrl ?? f.url,
                  fileKey: f.key,
                  fileSize: f.size,
                  mimeType: f.type,
                }));
                setAttachments((prev) => [...prev, ...next].slice(0, 3));
                toast.success(next.length === 1 ? "Document attached" : "Documents attached");
              }}
              onUploadError={(error: Error) => {
                toast.error(error.message || "Upload failed");
              }}
              appearance={{
                button:
                  "ut-ready:bg-slate-100 ut-ready:text-slate-700 ut-uploading:cursor-not-allowed h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 after:bg-naub-green",
                allowedContent: "hidden",
                container: "w-auto",
              }}
              content={{
                button({ ready, isUploading }) {
                  if (isUploading) return "Uploading...";
                  if (ready) return (
                    <span className="inline-flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attach
                    </span>
                  );
                  return "Attach";
                },
              }}
            />
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a message or attach a document..."
            className="min-h-[52px] flex-1 resize-none"
            rows={2}
          />
          <Button
            type="submit"
            disabled={pending || (!content.trim() && attachments.length === 0)}
            className="shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Send</span>
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Attach PDF or DOCX (max 16 MB, up to 3 files per message).
        </p>
      </form>
    </div>
  );
}
