"use client";

import PusherClient from "pusher-js";

let client: PusherClient | null = null;

function isConfigured(value?: string) {
  if (!value) return false;
  return !value.trim().toLowerCase().startsWith("your-pusher-");
}

export function getPusherClient() {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1";
  if (!isConfigured(key)) return null;

  if (!client) {
    client = new PusherClient(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
    });
  }
  return client;
}
