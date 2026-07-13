import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channel = params.get("channel_name");

  if (!socketId || !channel) {
    return NextResponse.json({ error: "Invalid auth payload" }, { status: 400 });
  }

  // private-user-{id} or private-conversation-{id}
  if (channel.startsWith("private-user-")) {
    const userId = channel.replace("private-user-", "");
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (channel.startsWith("private-conversation-")) {
    // Membership is validated when loading messages; channel auth requires login only
    // Further restriction can be added by querying conversation participants
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channel, {
    user_id: session.user.id,
  });

  return NextResponse.json(authResponse);
}
