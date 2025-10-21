"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
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

  // Users (from shared state)
  presenceUsers: User[]

  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setCurrentUser: (user: Omit<User, "id"> | null) => void

  // live-edit helpers
  startLiveEdit: (taskId: string, text: string, caret: number) => void
  pushLiveEdit: (taskId: string, text: string, caret: number) => void
  endLiveEdit: (taskId?: string) => void

  // typing indicators
  setTyping: (context: "new-task" | "edit-task", isTyping: boolean) => void
  getTypingUsers: (context: "new-task" | "edit-task") => User[]
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

// Optional: also pass your public key here (fine if you already configure globally)
const APP_ID =
  (process.env.NEXT_PUBLIC_AIRSTATE_APP_ID as string | undefined) ||
  (process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_KEY as string | undefined) ||
  (process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_TOKEN as string | undefined)

if (typeof window !== "undefined") {
  console.log("🔧 Airstate APP_ID:", APP_ID)
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  // 1) Room key – stable for this tab
  const params =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const joiningKey = params?.get("roomKey") ?? undefined
  const [roomKey] = useState(() => {
    const key = joiningKey || nanoid()
    if (typeof window !== "undefined") {
      console.log("🔑 Room key:", { joiningKey, finalKey: key, url: window.location.href })
    }
    return key
  })

  // 2) PER-TAB session id (not needed for shared state approach)
  const [sessionPeerId] = useState(() => {
    if (typeof window === "undefined") return `session:${nanoid()}`
    const k = `todo-session-id:${roomKey}`
    const existing = sessionStorage.getItem(k)
    const sid = existing || nanoid()
    if (!existing) sessionStorage.setItem(k, sid)
    const peerId = `${roomKey}:${sid}`
    if (typeof window !== "undefined") {
      console.log("🆔 Session peer ID:", { roomKey, sessionId: sid, peerId })
    }
    return peerId
  })

  // 3) User we show in the UI (id created on join or restored later)
  const [currentUser, setCurrentUserState] = useState<User | null>(null)

  const joinLink =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?roomKey=${roomKey}`
      : ""

  // 4) Shared application state (tasks + live edits + users)
  const [state, setState, isConnected] = useSharedState<SharedState>(
    defaultSharedState,
    {
      key: roomKey,
      appId: APP_ID,
      publicKey: APP_ID,
      token: APP_ID,
    } as any
  )



  // Keep user state up to date when user changes
  useEffect(() => {
    if (!currentUser) return

    if (typeof window !== "undefined") {
      console.log("👥 Adding/updating user in shared state:", currentUser.name)
    }
    setState((prev) => {
      const users = prev.users || []
      const existingIndex = users.findIndex(u => u.id === currentUser.id)
      
      const updatedUser: User = {
        ...currentUser,
        lastSeen: new Date().toISOString(),
        isActive: true,
      }

      if (existingIndex >= 0) {
        // Update existing user
        const newUsers = [...users]
        newUsers[existingIndex] = updatedUser
        return { ...prev, users: newUsers }
      } else {
        // Add new user
        return { ...prev, users: [...users, updatedUser] }
      }
    })
  }, [currentUser, setState])



  // 5) Derive presence users from shared state only
  const presenceUsers: User[] = useMemo(() => {
    if (typeof window !== "undefined") {
      console.log("👥 Getting users from shared state:", state.users)
    }
    
    if (!state.users) return currentUser ? [currentUser] : []
    
    // Filter active users from the last 30 seconds
    const now = Date.now()
    const activeUsers = state.users.filter(user => {
      const lastSeen = new Date(user.lastSeen).getTime()
      const isRecent = (now - lastSeen) < 30000 // 30 seconds
      return user.isActive && isRecent
    })
    
    if (typeof window !== "undefined") {
      console.log("📊 Active users:", activeUsers)
    }
    return activeUsers
  }, [state.users, currentUser])

  // 6) Task operations
  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">) => {
      if (!currentUser) return
      const newTask: Task = {
        ...task,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id, // use the user's identity
      }
      setState((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }))
    },
    [currentUser, setState]
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

  // 7) Push roomKey into URL once a user has joined / restored
  const pushKeyToUrl = useCallback(() => {
    if (typeof window === "undefined") return
    const hasKey = new URLSearchParams(window.location.search).has("roomKey")
    if (!hasKey) {
      router.replace(`${window.location.pathname}?roomKey=${roomKey}`, {
        scroll: false,
      })
    }
  }, [router, roomKey])

  // 8) Join / leave — create user id on FIRST join, or restore per room
  const setCurrentUser = useCallback(
    (user: Omit<User, "id"> | null) => {
      const savedKey = `collaborative-todo-user:${roomKey}`
      if (user) {
        // If there is a saved user for this room, reuse its id; otherwise create one now.
        const savedRaw =
          typeof window !== "undefined" ? localStorage.getItem(savedKey) : null
        let id: string | undefined
        try {
          if (savedRaw) id = (JSON.parse(savedRaw) as User)?.id
        } catch {}
        const fixed: User = { ...user, id: id ?? generateUserId() }
        setCurrentUserState(fixed)
        localStorage.setItem(savedKey, JSON.stringify(fixed))
        pushKeyToUrl()
      } else {
        // User is leaving - mark as inactive in shared state
        if (currentUser?.id) {
          setState((prev) => {
            const users = prev.users || []
            const updatedUsers = users.map(u => 
              u.id === currentUser.id 
                ? { ...u, isActive: false, lastSeen: new Date().toISOString() }
                : u
            )
            return { ...prev, users: updatedUsers }
          })
        }

        setCurrentUserState(null)
        localStorage.removeItem(savedKey)
        // clear my live edit marker
        setState((prev) => {
          const edits = { ...prev.live.edits }
          if (currentUser?.id) delete edits[currentUser.id]
          return { ...prev, live: { ...prev.live, edits } }
        })
      }
    },
    [roomKey, setState, pushKeyToUrl, currentUser?.id]
  )

  // 9) Restore saved user for this room (if any)
  useEffect(() => {
    const savedKey = `collaborative-todo-user:${roomKey}`
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(savedKey) : null
    if (raw) {
      try {
        const u = JSON.parse(raw) as User
        setCurrentUserState(u)
        pushKeyToUrl()
      } catch {
        localStorage.removeItem(savedKey)
      }
    }
  }, [roomKey, pushKeyToUrl])

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
            [currentUser.id]: {
              taskId,
              userId: currentUser.id,
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
    [setState, currentUser]
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
            [currentUser.id]: {
              taskId,
              userId: currentUser.id,
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
    [setState, currentUser]
  )

  const endLiveEdit = useCallback(() => {
    if (!currentUser) return
    setState((prev) => {
      const edits = { ...prev.live.edits }
      delete edits[currentUser.id]
      return { ...prev, live: { ...prev.live, edits } }
    })
  }, [setState, currentUser])

  // Periodic user heartbeat and cleanup
  useEffect(() => {
    if (!currentUser) return

    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        console.log("💓 User heartbeat")
      }
      
      setState((prev) => {
        const users = prev.users || []
        const now = new Date().toISOString()
        const currentTime = Date.now()
        
        // Update current user's lastSeen and clean up inactive users
        const updatedUsers = users
          .map(user => 
            user.id === currentUser.id 
              ? { ...user, lastSeen: now, isActive: true }
              : user
          )
          .filter(user => {
            // Remove users that haven't been seen for more than 60 seconds
            const lastSeen = new Date(user.lastSeen).getTime()
            const timeDiff = currentTime - lastSeen
            return timeDiff < 60000 // 60 seconds
          })

        // Clean up stale typing indicators (older than 5 seconds)
        const updatedTyping: Record<string, any> = {}
        Object.entries(prev.live.typing || {}).forEach(([userId, indicator]) => {
          if (indicator) {
            const lastTyped = new Date(indicator.lastTyped).getTime()
            if (currentTime - lastTyped < 5000) { // 5 seconds
              updatedTyping[userId] = indicator
            }
          }
        })

        return { 
          ...prev, 
          users: updatedUsers,
          live: {
            ...prev.live,
            typing: updatedTyping
          }
        }
      })
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [currentUser, setState])

  // Typing indicator helpers
  const setTyping = useCallback((context: "new-task" | "edit-task", isTyping: boolean) => {
    if (!currentUser) return
    
    setState((prev) => {
      const newTyping = { ...prev.live.typing }
      
      if (isTyping) {
        newTyping[currentUser.id] = {
          userId: currentUser.id,
          userName: currentUser.name,
          userColor: currentUser.color,
          isTyping: true,
          lastTyped: new Date().toISOString(),
          context
        }
      } else {
        delete newTyping[currentUser.id]
      }
      
      return {
        ...prev,
        live: {
          ...prev.live,
          typing: newTyping
        }
      }
    })
  }, [currentUser, setState])

  const getTypingUsers = useCallback((context: "new-task" | "edit-task") => {
    const now = Date.now()
    const typingIndicators = Object.values(state.live.typing || {}).filter(indicator => {
      if (!indicator || !indicator.isTyping || indicator.context !== context) return false
      
      // Filter out the current user - don't show their own typing indicator
      if (currentUser && indicator.userId === currentUser.id) return false
      
      // Filter out stale typing indicators (older than 3 seconds)
      const lastTyped = new Date(indicator.lastTyped).getTime()
      return (now - lastTyped) < 3000
    })

    return typingIndicators.map(indicator => 
      presenceUsers.find(user => user.id === indicator.userId)
    ).filter(Boolean) as User[]
  }, [state.live.typing, presenceUsers, currentUser])

  const value: TodoContextType = {
    state,
    isConnected,
    currentUser,
    roomKey,
    joinLink,

    presenceUsers,

    addTask,
    updateTask,
    deleteTask,
    setCurrentUser,

    startLiveEdit,
    pushLiveEdit,
    endLiveEdit,

    setTyping,
    getTypingUsers,
  }

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

export function useTodo() {
  const ctx = useContext(TodoContext)
  if (ctx === undefined) throw new Error("useTodo must be used within a TodoProvider")
  return ctx
}
