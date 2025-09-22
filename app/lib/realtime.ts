import type { SharedState, Task, User } from "@/app/types"

// Mock real-time state management
class MockRealtimeClient {
  private state: SharedState = {
    tasks: [],
    users: {},
  }
  private listeners: Set<(state: SharedState) => void> = new Set()

  constructor() {
    // Simulate some initial data
    this.state = {
      tasks: [
        {
          id: "1",
          text: "Welcome to your collaborative to-do list!",
          completed: false,
          createdAt: new Date().toISOString(),
          createdBy: "system",
        },
        {
          id: "2",
          text: "Add your first task below",
          completed: false,
          createdAt: new Date().toISOString(),
          createdBy: "system",
        },
      ],
      users: {},
    }
  }

  getState(): SharedState {
    return this.state
  }

  setState(newState: Partial<SharedState>): void {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }

  subscribe(callback: (state: SharedState) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.state))
  }

  // Task operations
  addTask(task: Omit<Task, "id" | "createdAt">): void {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    this.setState({
      tasks: [...this.state.tasks, newTask],
    })
  }

  updateTask(id: string, updates: Partial<Task>): void {
    this.setState({
      tasks: this.state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    })
  }

  deleteTask(id: string): void {
    this.setState({
      tasks: this.state.tasks.filter((task) => task.id !== id),
    })
  }

  // User operations
  setUser(userId: string, user: User): void {
    this.setState({
      users: {
        ...this.state.users,
        [userId]: user,
      },
    })
  }

  removeUser(userId: string): void {
    const { [userId]: _, ...users } = this.state.users
    this.setState({ users })
  }
}

// Create singleton instance
export const realtimeClient = new MockRealtimeClient()

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
