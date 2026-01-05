import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateDescPreview(description: string | null | undefined): string | null {
  if (!description) return null;
  const preview = description.slice(0, 100).trim();
  return description.length > 100 ? `${preview}...` : preview;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  // Returns badge variant name for the status
  const variants: Record<string, string> = {
    BACKLOG: "backlog",
    SAVED: "saved",
    TO_APPLY: "toApply",
    APPLIED: "applied",
    ASSESSMENT: "assessment",
    INTERVIEW: "interview",
    OFFER: "offer",
    REJECTED: "rejected",
    WITHDRAWN: "withdrawn",
  };
  return variants[status] || "backlog";
}

export function getStatusBadgeVariant(status: string): "backlog" | "saved" | "toApply" | "applied" | "assessment" | "interview" | "offer" | "rejected" | "withdrawn" {
  const variants = {
    BACKLOG: "backlog" as const,
    SAVED: "saved" as const,
    TO_APPLY: "toApply" as const,
    APPLIED: "applied" as const,
    ASSESSMENT: "assessment" as const,
    INTERVIEW: "interview" as const,
    OFFER: "offer" as const,
    REJECTED: "rejected" as const,
    WITHDRAWN: "withdrawn" as const,
  };
  return variants[status as keyof typeof variants] || "backlog";
}

export function getInterestStars(interest: number): string {
  return "⭐".repeat(Math.max(0, Math.min(10, interest)));
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d < new Date();
}