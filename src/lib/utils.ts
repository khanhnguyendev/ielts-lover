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
