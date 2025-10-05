
"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
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
  // live-edit helpers
  startLiveEdit: (taskId: string, text: string, caret: number) => void
  pushLiveEdit: (taskId: string, text: string, caret: number) => void
  endLiveEdit: (taskId?: string) => void
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

// Resolve your public key once (it’s also configured globally in `airstate.client.ts`)
// Passing it here too keeps compatibility with older SDK builds.
const APP_ID =
  (process.env.NEXT_PUBLIC_AIRSTATE_APP_ID as string | undefined) ||
  (process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_KEY as string | undefined) ||
  (process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_TOKEN as string | undefined)

export function TodoProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  // 1) Room key: take ?roomKey from URL if present, otherwise generate one.
  //    We only push it to the URL AFTER a user joins (or restore finds a user).
  const params =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const joiningKey = params?.get("roomKey") ?? undefined
  const [roomKey] = useState(() => joiningKey || nanoid())

  // 2) Stable per-room user id (prevents duplicate presence on refresh)
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

  // 3) Shared state for this room (pass key under common names for compatibility)
  const [state, setState, isConnected] = useSharedState<SharedState>(
    defaultSharedState,
    {
      key: roomKey,
      appId: APP_ID,
      publicKey: APP_ID,
      token: APP_ID,
    } as any
  )

  // 4) Add myself to presence when I have a currentUser.
  //    Do NOT gate on `isConnected` (it can lag slightly in prod).
  useEffect(() => {
    if (!currentUser || state.users[userId]) return
    const userCount = Object.keys(state.users).length
    if (userCount >= 10) return
    setState((prev) => ({
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
  }, [currentUser, userId, state.users, setState])

  // 5) Heartbeat every 10s to keep me “active”
  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(() => {
      setState((prev) => ({
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
  }, [currentUser, userId, setState])

  // 6) Cleanup presence on unmount
  useEffect(() => {
    return () => {
      setState((prev) => {
        const { [userId]: _removed, ...users } = prev.users
        return { ...prev, users }
      })
    }
  }, [setState, userId])

  // 7) Task operations
  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">) => {
      if (!currentUser) return
      const newTask: Task = {
        ...task,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        createdBy: userId,
      }
      setState((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }))
    },
    [currentUser, userId, setState]
  )

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }))
    },
    [setState]
  )

  const deleteTask = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }))
    },
    [setState]
  )

  // 8) Push roomKey into URL once a user has “joined” (or on restore)
  const pushKeyToUrl = useCallback(() => {
    if (typeof window === "undefined") return
    const hasKey = new URLSearchParams(window.location.search).has("roomKey")
    if (!hasKey) {
      router.replace(`${window.location.pathname}?roomKey=${roomKey}`, {
        scroll: false,
      })
    }
  }, [router, roomKey])

  const setCurrentUser = useCallback(
    (user: Omit<User, "id"> | null) => {
      if (user) {
        const fixed: User = { ...user, id: userId }
        setCurrentUserState(fixed)
        localStorage.setItem("collaborative-todo-user", JSON.stringify(fixed))
        pushKeyToUrl()
      } else {
        setCurrentUserState(null)
        localStorage.removeItem("collaborative-todo-user")
        // clear my live edit marker
        setState((prev) => {
          const edits = { ...prev.live.edits }
          delete edits[userId]
          return { ...prev, live: { ...prev.live, edits } }
        })
      }
    },
    [userId, setState, pushKeyToUrl]
  )

  // 9) Restore saved user (normalize id to our stable userId)
  useEffect(() => {
    const savedUser = localStorage.getItem("collaborative-todo-user")
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as User
        setCurrentUserState({ ...u, id: userId })
        pushKeyToUrl()
      } catch {
        localStorage.removeItem("collaborative-todo-user")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // 10) Live edit helpers
  const startLiveEdit = useCallback(
    (taskId: string, text: string, caret: number) => {
      if (!currentUser) return
      setState((prev) => ({
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
    },
    [setState, userId, currentUser]
  )

  const pushLiveEdit = useCallback(
    (taskId: string, text: string, caret: number) => {
      if (!currentUser) return
      setState((prev) => ({
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
    },
    [setState, userId, currentUser]
  )

  const endLiveEdit = useCallback(() => {
    setState((prev) => {
      const edits = { ...prev.live.edits }
      delete edits[userId]
      return { ...prev, live: { ...prev.live, edits } }
    })
  }, [setState, userId])

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
