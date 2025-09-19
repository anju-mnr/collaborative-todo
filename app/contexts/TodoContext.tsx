"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { SharedState, Task, User } from "@/app/types"

interface TodoContextType {
  state: SharedState
  isConnected: boolean
  currentUser: User | null
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setUser: (userId: string, user: User) => void
  removeUser: (userId: string) => void
  setCurrentUser: (user: User | null) => void
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

// Generate unique ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

const dummyUsers: Record<string, User> = {
  "alice-123": {
    id: "alice-123",
    name: "Alice Johnson",
    color: "bg-blue-500",
    isActive: true,
    lastSeen: new Date(),
  },
  "bob-456": {
    id: "bob-456",
    name: "Bob Smith",
    color: "bg-green-500",
    isActive: true,
    lastSeen: new Date(),
  },
  "carol-789": {
    id: "carol-789",
    name: "Carol Davis",
    color: "bg-purple-500",
    isActive: false,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
}

const dummyTasks: Task[] = [
  {
    id: "alice-task-1",
    text: "Review project requirements",
    completed: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdBy: "alice-123",
  },
  {
    id: "alice-task-2",
    text: "Update documentation",
    completed: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    createdBy: "alice-123",
  },
  {
    id: "bob-task-1",
    text: "Fix login bug",
    completed: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    createdBy: "bob-456",
  },
  {
    id: "bob-task-2",
    text: "Test mobile responsiveness",
    completed: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    createdBy: "bob-456",
  },
  {
    id: "carol-task-1",
    text: "Design new landing page",
    completed: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    createdBy: "carol-789",
  },
]

// Initial state
const initialState: SharedState = {
  tasks: [
    {
      id: "1",
      text: "Welcome to your collaborative to-do list!",
      completed: false,
      createdAt: new Date(),
      createdBy: "system",
    },
    {
      id: "2",
      text: "Add your first task below",
      completed: false,
      createdAt: new Date(),
      createdBy: "system",
    },
    ...dummyTasks,
  ],
  users: {
    ...dummyUsers,
  },
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SharedState>(initialState)
  const [isConnected] = useState(true)
  const [currentUser, setCurrentUserState] = useState<User | null>(null)

  useEffect(() => {
    const syncInterval = setInterval(() => {
      const savedState = localStorage.getItem("collaborative-todo-state")
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState)
          const tasksWithDates = parsedState.tasks.map((task: Task) => ({
            ...task,
            createdAt: new Date(task.createdAt),
          }))

          setState((prevState) => {
            // Only update if there are actual changes
            const hasChanges =
              JSON.stringify(prevState.tasks) !== JSON.stringify(tasksWithDates) ||
              JSON.stringify(prevState.users) !== JSON.stringify(parsedState.users)

            if (hasChanges) {
              return {
                ...parsedState,
                tasks: tasksWithDates,
                users: {
                  ...parsedState.users,
                  ...(currentUser ? { [currentUser.id]: currentUser } : {}),
                },
              }
            }
            return prevState
          })
        } catch (error) {
          console.error("Failed to sync state:", error)
        }
      }
    }, 1000) // Poll every second for real-time feel

    return () => clearInterval(syncInterval)
  }, [currentUser])

  useEffect(() => {
    const channel = new BroadcastChannel("collaborative-todo-sync")

    channel.onmessage = (event) => {
      if (event.data.type === "STATE_UPDATE") {
        const { tasks, users } = event.data.payload
        const tasksWithDates = tasks.map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }))

        setState((prevState) => ({
          ...prevState,
          tasks: tasksWithDates,
          users: {
            ...users,
            ...(currentUser ? { [currentUser.id]: currentUser } : {}),
          },
        }))
      }
    }

    return () => channel.close()
  }, [currentUser])

  useEffect(() => {
    const savedUser = localStorage.getItem("collaborative-todo-user")
    const savedState = localStorage.getItem("collaborative-todo-state")

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUserState(user)
        setState((prevState) => ({
          ...prevState,
          users: {
            ...prevState.users,
            [user.id]: user,
          },
        }))
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("collaborative-todo-user")
      }
    }

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        const tasksWithDates = parsedState.tasks.map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }))
        setState((prevState) => ({
          ...parsedState,
          tasks: tasksWithDates,
          users: prevState.users,
        }))
      } catch (error) {
        console.error("Failed to parse saved state:", error)
        localStorage.removeItem("collaborative-todo-state")
      }
    }
  }, [])

  useEffect(() => {
    if (state.tasks.length > 0) {
      localStorage.setItem("collaborative-todo-state", JSON.stringify(state))

      // Broadcast changes to other tabs
      const channel = new BroadcastChannel("collaborative-todo-sync")
      channel.postMessage({
        type: "STATE_UPDATE",
        payload: {
          tasks: state.tasks,
          users: state.users,
        },
      })
      channel.close()
    }
  }, [state])

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date(),
    }
    setState((prevState) => ({
      ...prevState,
      tasks: [...prevState.tasks, newTask],
    }))
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState((prevState) => ({
      ...prevState,
      tasks: prevState.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setState((prevState) => ({
      ...prevState,
      tasks: prevState.tasks.filter((task) => task.id !== id),
    }))
  }, [])

  const setUser = useCallback((userId: string, user: User) => {
    setState((prevState) => ({
      ...prevState,
      users: {
        ...prevState.users,
        [userId]: user,
      },
    }))
  }, [])

  const removeUser = useCallback((userId: string) => {
    setState((prevState) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [userId]: removed, ...users } = prevState.users
      return {
        ...prevState,
        users,
      }
    })
  }, [])

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user)
    if (user) {
      localStorage.setItem("collaborative-todo-user", JSON.stringify(user))
    } else {
      localStorage.removeItem("collaborative-todo-user")
    }
  }, [])

  const value: TodoContextType = {
    state,
    isConnected,
    currentUser,
    addTask,
    updateTask,
    deleteTask,
    setUser,
    removeUser,
    setCurrentUser,
  }

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

export function useTodo() {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider")
  }
  return context
}
