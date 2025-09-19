import { configure } from "@airstate/react"
import type { SharedState } from "@/app/types"

// Validate environment variables
if (!process.env.NEXT_PUBLIC_AIRSTATE_APP_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_AIRSTATE_APP_ID environment variable. " +
      "Please add it to your .env.local file. " +
      "Get your App ID from https://airstate.dev/dashboard",
  )
}

// Configure airstate with your environment variable
configure({
  appId: process.env.NEXT_PUBLIC_AIRSTATE_APP_ID,
  server: `wss://server.airstate.dev/ws`,
})

// Default shared state
export const defaultSharedState: SharedState = {
  tasks: [
    {
      id: "welcome-1",
      text: "Welcome to your collaborative to-do list!",
      completed: false,
      createdAt: new Date().toISOString(),
      createdBy: "system",
    },
    {
      id: "welcome-2", 
      text: "Share the room link to collaborate with others",
      completed: false,
      createdAt: new Date().toISOString(),
      createdBy: "system",
    },
  ],
  users: {},
}

// Generate unique room key
export const generateRoomKey = (): string => {
  return Math.random().toString(36).substr(2, 10)
}

// Generate unique user ID
export const generateUserId = (): string => {
  return `user_${Math.random().toString(36).substr(2, 9)}`
}

// Generate random user color (hex values for dynamic styles)
export const generateUserColor = (): string => {
  const colors = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", 
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
    "#10b981", "#f59e0b"
  ]
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
