import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { answerProjectGuideQuestion } from "@/lib/ai/project-guide-knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_MESSAGES = 8;

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as { role?: unknown; content?: unknown };
      if (candidate.role !== "user" && candidate.role !== "assistant") return null;
      if (typeof candidate.content !== "string") return null;

      const content = candidate.content.trim().slice(0, MAX_MESSAGE_LENGTH);
      if (!content) return null;
      return { role: candidate.role, content };
    })
    .filter((item): item is ChatMessage => Boolean(item))
    .slice(-MAX_HISTORY_MESSAGES);
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: req.nextUrl.protocol === "https:",
  });

  if (process.env.NODE_ENV === "production" && !token?.sub) {
    return jsonResponse({ error: "Please sign in to use the project guide." }, 401);
  }

  const body = await req.json().catch(() => null);
  const messages = normalizeMessages((body as { messages?: unknown } | null)?.messages);
  const lastMessage = messages.at(-1);

  if (!lastMessage || lastMessage.role !== "user") {
    return jsonResponse({ error: "Send a project question to continue." }, 400);
  }

  return jsonResponse({ answer: answerProjectGuideQuestion(lastMessage.content) });
}
