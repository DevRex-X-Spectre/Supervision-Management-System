import Pusher from "pusher";

function isConfigured(value?: string) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return !normalized.startsWith("your-pusher-");
}

function createPusher() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER ?? "mt1";

  if (!isConfigured(appId) || !isConfigured(key) || !isConfigured(secret)) {
    // Lightweight no-op stand-in so local code paths do not crash before env is set
    return {
      trigger: async () => ({}) as unknown,
      authorizeChannel: () => ({ auth: "" }),
    } as unknown as Pusher;
  }

  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}

export const pusherServer = createPusher();
