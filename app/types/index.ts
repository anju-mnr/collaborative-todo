export interface Task {
  id: string
  text: string
  description?: string
  completed: boolean
  createdAt: string // ISO string instead of Date object
  createdBy: string
}

export interface User {
  id: string
  name: string
  color: string
  isActive: boolean
  lastSeen: string // ISO string instead of Date object
  initials?: string
}

export interface SharedState {
  tasks: Task[]
  users: User[] // Add users to shared state as fallback
  live: {
    edits: Record<string, LiveEdit> // keyed by editor userId
  }
  [key: string]: any // Index signature for Airstate compatibility
}

export type LiveEdit = {
  taskId: string
  userId: string
  text: string
  caret: number
  name: string
  initials: string
  color: string
  updatedAt: string
}


