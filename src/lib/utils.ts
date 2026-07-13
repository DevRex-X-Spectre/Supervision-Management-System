import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fullName(firstName: string, lastName: string, title?: string | null) {
  const name = `${firstName} ${lastName}`.trim();
  return title ? `${title} ${name}` : name;
}

export function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Not set";
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "Not set";
  return format(new Date(date), "dd MMM yyyy, HH:mm");
}

export function formatRelative(date: Date | string | null | undefined) {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function deadlineLabel(date: Date | string | null | undefined) {
  if (!date) return "No deadline";
  const d = new Date(date);
  if (isPast(d) && !isToday(d)) return `Overdue (${formatDate(d)})`;
  if (isToday(d)) return "Due today";
  if (isTomorrow(d)) return "Due tomorrow";
  return `Due ${formatDate(d)}`;
}

export function roleLabel(role: string) {
  switch (role) {
    case "STUDENT":
      return "Student";
    case "SUPERVISOR":
      return "Supervisor";
    case "COORDINATOR":
      return "Project Coordinator";
    default:
      return role;
  }
}

export function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function dashboardPath(role: string) {
  switch (role) {
    case "STUDENT":
      return "/student";
    case "SUPERVISOR":
      return "/supervisor";
    case "COORDINATOR":
      return "/coordinator";
    default:
      return "/login";
  }
}

export function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export const FILE_CONSTRAINTS = {
  maxSizeBytes: 10 * 1024 * 1024,
  maxSizeLabel: "10 MB",
  allowedMimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,
  allowedExtensions: [".pdf", ".docx"] as const,
  allowedLabel: "PDF or DOCX",
};
