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
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

export function TodoProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  // 1) Resolve room key (same as before), but write it into the URL if missing (prevents new room on refresh)

  // TodoContext.tsx
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const joiningKey = params?.get("roomKey")
  const [roomKey] = useState(() => joiningKey || nanoid())

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!joiningKey && roomKey) {
      router.replace(`${window.location.pathname}?roomKey=${roomKey}`)
    }
  }, [joiningKey, roomKey, router])



  // 2) STABLE userId per room (prevents duplicate presence entries after refresh)


  // TodoContext.tsx
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

  // 3) Shared state is keyed by roomKey (unchanged)


  // TodoContext.tsx
  const [state, setState, isConnected] =
    useSharedState<SharedState>(defaultSharedState, { key: roomKey })


  // 4) Add current user to shared state (unchanged logic, but userId is now stable)
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
          id: userId, // ensure id is our stable id
          isActive: true,
          lastSeen: new Date().toISOString(),
        },
      },
    }))
  }, [isConnected, currentUser, userId, state.users, setState])

  // 5) Heartbeat
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

  // 6) Cleanup on unmount
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

  // 7) Task ops

  //TodoContext.tsx

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    if (!currentUser) return
    const newTask: Task = {
      ...task,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      createdBy: userId, // created by the stable id
    }
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }))
  }, [currentUser, userId, setState])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({ 
      ...prev, 
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)) }))
  }, [setState])

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }))
  }, [setState])



  // 8) Make sure currentUser.id always equals our stable userId (fixes “My Tasks” & presence identity)
  const setCurrentUser = useCallback((user: Omit<User, "id"> | null) => {
    if (user) {
      const fixed: User = { ...user, id: userId } // inject stable id here
      setCurrentUserState(fixed)
      localStorage.setItem("collaborative-todo-user", JSON.stringify(fixed))
    } else {
      setCurrentUserState(null)
      localStorage.removeItem("collaborative-todo-user")
    }
  }, [userId])

  // 9) Load saved user (and normalize id)
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
  }

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

export function useTodo() {
  const ctx = useContext(TodoContext)
  if (ctx === undefined) throw new Error("useTodo must be used within a TodoProvider")
  return ctx
}
