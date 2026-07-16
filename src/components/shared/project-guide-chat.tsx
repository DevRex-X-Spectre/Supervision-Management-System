"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  BookOpen,
  Bot,
  GraduationCap,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type GuideMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const STARTER_MESSAGES: GuideMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "I can help with project structure, supervisor feedback, research methodology, academic writing, and APA 7. What part of the project are you working on?",
  },
];

const SUGGESTIONS = [
  "How should Chapter One be structured?",
  "Give me an APA 7 reference pattern for a journal article.",
  "Create a supervisor checklist for Chapter Three.",
  "How do I turn my topic into objectives?",
];

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ProjectGuideChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<GuideMessage[]>(STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const requestMessages = useMemo(
    () =>
      messages
        .filter((message) => message.id !== "welcome")
        .map(({ role, content }) => ({ role, content }))
        .slice(-8),
    [messages]
  );

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, pending]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open]);

  async function sendMessage(nextContent?: string) {
    const content = (nextContent ?? input).trim();
    if (!content || pending) return;

    const userMessage: GuideMessage = {
      id: newId("user"),
      role: "user",
      content,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setOpen(true);
    setPending(true);

    try {
      const response = await fetch("/api/ai/project-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...requestMessages,
            {
              role: userMessage.role,
              content: userMessage.content,
            },
          ],
        }),
      });
      const data = (await response.json().catch(() => null)) as { answer?: string; error?: string } | null;

      if (!response.ok || !data?.answer) {
        const error = data?.error ?? "The project guide could not respond right now.";
        setMessages((current) => [
          ...current,
          {
            id: newId("assistant-error"),
            role: "assistant",
            content: error,
          },
        ]);
        toast.error(error);
        return;
      }

      const answer = data.answer;
      setMessages((current) => [
        ...current,
        {
          id: newId("assistant"),
          role: "assistant",
          content: answer,
        },
      ]);
    } catch {
      const error = "Network problem. Please check your connection and try again.";
      setMessages((current) => [
        ...current,
        {
          id: newId("assistant-network"),
          role: "assistant",
          content: error,
        },
      ]);
      toast.error(error);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          aria-label="Project guide chat"
          className="flex h-[min(720px,calc(100vh-2rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 sm:w-[430px]"
        >
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Project Guide AI</p>
                <p className="truncate text-xs text-slate-300">Rule-based academic guide</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-white/10 hover:text-white"
              title="Close project guide"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close project guide</span>
            </Button>
          </header>

          <div className="chat-scroll flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
            <div className="space-y-3">
              {messages.map((message) => {
                const user = message.role === "user";
                return (
                  <div key={message.id} className={cn("flex", user ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[86%] rounded-xl px-3.5 py-3 text-sm leading-relaxed shadow-sm",
                        user
                          ? "rounded-br-sm bg-naub-green text-white"
                          : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                      )}
                    >
                      {user ? (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      ) : (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 break-words">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-slate-950">{children}</strong>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                );
              })}

              {messages.length === 1 ? (
                <div className="grid gap-2 pt-1">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 shadow-sm transition hover:border-naub-green/40 hover:bg-naub-green-soft"
                      onClick={() => void sendMessage(suggestion)}
                    >
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-naub-green" />
                      <span className="min-w-0 break-words">{suggestion}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {pending ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-600 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-naub-green" />
                    <span>Thinking</span>
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </div>

          <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about your project, methodology, or APA 7..."
                className="max-h-32 min-h-12 resize-none"
                rows={2}
                maxLength={1200}
              />
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 shrink-0"
                disabled={pending || !input.trim()}
                title="Send question"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send question</span>
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <Button
          type="button"
          className="h-14 rounded-full px-4 shadow-2xl shadow-naub-green/25"
          onClick={() => setOpen(true)}
          title="Open project guide"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <Bot className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Project Guide</span>
          <MessageCircle className="h-4 w-4 sm:hidden" />
        </Button>
      )}

      <div className="pointer-events-none hidden items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur sm:flex">
        <BookOpen className="h-3.5 w-3.5 text-naub-green" />
        <span>Academic standards assistant</span>
      </div>
    </div>
  );
}
