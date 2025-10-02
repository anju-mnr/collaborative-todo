"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useSharedState } from "@airstate/react"
import { nanoid } from "nanoid"
import type { SharedState, Task, User } from "@/app/types"
import { defaultSharedState, generateUserId } from "@/app/lib/airstate"
import { useRouter } from "next/navigation"

interface TodoContextType {
  state: SharedState
  isConnected: boolean
  currentUser: User | null
  roomKey: string
  joinLink: string
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setCurrentUser: (user: Omit<User, "id"> | null) => void

  // NEW: live edit helpers
  startLiveEdit: (taskId: string, text: string, caret: number) => void
  pushLiveEdit: (taskId: string, text: string, caret: number) => void
  endLiveEdit: (taskId?: string) => void
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

export function TodoProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  // --- Room key (write to URL if missing) ---
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const joiningKey = params?.get("roomKey")
  const [roomKey] = useState(() => joiningKey || nanoid())

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!joiningKey && roomKey) {
      router.replace(`${window.location.pathname}?roomKey=${roomKey}`)
    }
  }, [joiningKey, roomKey, router])

  // --- Stable per-room user id ---
  const [userId] = useState(() => {
    if (typeof window === "undefined") return generateUserId()
    const storageKey = `todo-user-id:${roomKey}`
    const saved = localStorage.getItem(storageKey)
    const id = saved || generateUserId()
    if (!saved) localStorage.setItem(storageKey, id)
    return id
  })

  const [currentUser, setCurrentUserState] = useState<User | null>(null)

  const joinLink =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?roomKey=${roomKey}`
      : ""

  // --- Shared state (AirState) ---
  const [state, setState, isConnected] =
    useSharedState<SharedState>(defaultSharedState, { key: roomKey })

  // --- Presence: add self when joined ---
  useEffect(() => {
    if (!isConnected || !currentUser || state.users[userId]) return
    const userCount = Object.keys(state.users).length
    if (userCount >= 10) return
    setState(prev => ({
      ...prev,
      users: {
        ...prev.users,
        [userId]: {
          ...currentUser,
          id: userId,
          isActive: true,
          lastSeen: new Date().toISOString(),
        },
      },
    }))
  }, [isConnected, currentUser, userId, state.users, setState])

  // --- Presence: heartbeat ---
  useEffect(() => {
    if (!isConnected || !currentUser) return
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        users: {
          ...prev.users,
          [userId]: {
            ...prev.users[userId],
            lastSeen: new Date().toISOString(),
            isActive: true,
          },
        },
      }))
    }, 10000)
    return () => clearInterval(interval)
  }, [isConnected, currentUser, userId, setState])

  // --- Cleanup user on unmount ---
  useEffect(() => {
    return () => {
      if (isConnected && currentUser) {
        setState(prev => {
          const { [userId]: _removed, ...users } = prev.users
          return { ...prev, users }
        })
      }
    }
  }, [isConnected, currentUser, setState, userId])

  // --- Task ops ---
  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    if (!currentUser) return
    const newTask: Task = {
      ...task,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      createdBy: userId,
    }
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }))
  }, [currentUser, userId, setState])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }))
  }, [setState])

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }))
  }, [setState])

  // --- Current user setter (inject stable id) ---
  const setCurrentUser = useCallback((user: Omit<User, "id"> | null) => {
    if (user) {
      const fixed: User = { ...user, id: userId }
      setCurrentUserState(fixed)
      localStorage.setItem("collaborative-todo-user", JSON.stringify(fixed))
    } else {
      setCurrentUserState(null)
      localStorage.removeItem("collaborative-todo-user")
      // Optional: also clear my live edit record when logging out
      setState(prev => {
        const edits = { ...prev.live.edits }
        delete edits[userId]
        return { ...prev, live: { ...prev.live, edits } }
      })
    }
  }, [userId, setState])

  // --- Restore saved user (normalize id) ---
  useEffect(() => {
    const savedUser = localStorage.getItem("collaborative-todo-user")
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as User
        setCurrentUserState({ ...u, id: userId })
      } catch {
        localStorage.removeItem("collaborative-todo-user")
      }
    }
  }, [userId])

  // ===== LIVE EDIT HELPERS (INSIDE the provider) =====
  const startLiveEdit = useCallback((taskId: string, text: string, caret: number) => {
    if (!currentUser) return
    setState(prev => ({
      ...prev,
      live: {
        ...prev.live,
        edits: {
          ...prev.live.edits,
          [userId]: {
            taskId,
            userId,
            text,
            caret,
            name: currentUser.name,
            initials: currentUser.initials ?? "",
            color: currentUser.color,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    }))
  }, [setState, userId, currentUser])

  const pushLiveEdit = useCallback((taskId: string, text: string, caret: number) => {
    if (!currentUser) return
    setState(prev => ({
      ...prev,
      live: {
        ...prev.live,
        edits: {
          ...prev.live.edits,
          [userId]: {
            taskId,
            userId,
            text,
            caret,
            name: currentUser.name,
            initials: currentUser.initials ?? "",
            color: currentUser.color,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    }))
  }, [setState, userId, currentUser])

  const endLiveEdit = useCallback((taskId?: string) => {
    setState(prev => {
      const edits = { ...prev.live.edits }
      delete edits[userId]
      return { ...prev, live: { ...prev.live, edits } }
    })
  }, [setState, userId])

  // Clear my live record on unmount (or tab close)
  useEffect(() => {
    return () => {
      setState(prev => {
        const edits = { ...prev.live.edits }
        delete edits[userId]
        return { ...prev, live: { ...prev.live, edits } }
      })
    }
  }, [setState, userId])
  // ===== END LIVE EDIT HELPERS =====

  const value: TodoContextType = {
    state,
    isConnected,
    currentUser,
    roomKey,
    joinLink,
    addTask,
    updateTask,
    deleteTask,
    setCurrentUser,
    // live edit
    startLiveEdit,
    pushLiveEdit,
    endLiveEdit,
  }

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

export function useTodo() {
  const ctx = useContext(TodoContext)
  if (ctx === undefined) throw new Error("useTodo must be used within a TodoProvider")
  return ctx
}
