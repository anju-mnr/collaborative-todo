export interface Task {
  id: string
  text: string
  description?: string
  completed: boolean
  createdAt: Date
  createdBy: string
}

export interface User {
  id: string
  name: string
  color: string
  isActive: boolean
  lastSeen: Date
  initials?: string
}

export interface SharedState {
  tasks: Task[]
  users: Record<string, User>
}
