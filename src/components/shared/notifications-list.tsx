"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
  type: string;
};

export function NotificationsList({ items }: { items: NotificationItem[] }) {
  const [pending, start] = useTransition();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="You are all caught up"
        description="New submissions, feedback, messages, and deadlines will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => start(() => markAllNotificationsReadAction())}
        >
          Mark all as read
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={`rounded-2xl border px-4 py-3 transition-colors ${
              n.readAt ? "border-slate-100 bg-white" : "border-emerald-100 bg-emerald-50/40"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                <p className="mt-1 text-sm text-slate-600">{n.body}</p>
                <p className="mt-2 text-xs text-slate-400">{formatRelative(n.createdAt)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {n.link ? (
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={n.link}
                      onClick={() => start(() => markNotificationReadAction(n.id))}
                    >
                      Open
                    </Link>
                  </Button>
                ) : null}
                {!n.readAt ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => start(() => markNotificationReadAction(n.id))}
                  >
                    Mark read
                  </Button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
