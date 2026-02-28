import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatCredits(amount: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | number, includeYear = true) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: includeYear ? "numeric" : undefined,
  });
}

export function formatTime(date: string | Date | number) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(date: string | Date | number) {
  const d = new Date(date);
  return `${formatDate(d)} • ${formatTime(d)}`;
}
