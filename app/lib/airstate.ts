import { createClient } from "@airstate/client"
import type { SharedState } from "@/app/types"

// Validate environment variables
if (!process.env.NEXT_PUBLIC_AIRSTATE_APP_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_AIRSTATE_APP_ID environment variable. " +
      "Please add it to your .env.local file. " +
      "Get your App ID from https://airstate.dev/dashboard",
  )
}

// Initialize AirState client
export const airstate = createClient({
  appId: process.env.NEXT_PUBLIC_AIRSTATE_APP_ID,
})

// Default shared state
export const defaultSharedState: SharedState = {
  tasks: [],
  users: {},
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
