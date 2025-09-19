import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate random user color
export const generateUserColor = (): string => {
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Generate user initials from name
export const generateInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
}

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}
