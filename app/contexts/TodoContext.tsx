"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useSharedState } from "@airstate/react"
import { configure } from "@airstate/client"            
import { nanoid } from "nanoid"
import type { SharedState, Task, User } from "@/app/types"
import { defaultSharedState, generateUserId } from "@/app/lib/airstate"
import { useRouter } from "next/navigation"
import { setupWebSocketMonitoring, setupVisibilityRecovery, setupNetworkRecovery } from "@/app/lib/websocket-recovery"
import { checkAirStateHealth } from "@/app/lib/airstate-health"

// --- Configure AirState (client-side) ---
const APP_ID =
  (process.env.NEXT_PUBLIC_AIRSTATE_APP_ID as string | undefined) ||
  (process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_KEY as string | undefined) ||
  (process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_TOKEN as string | undefined); // your "Public Key" works here

// Enhanced AirState configuration with better connection handling
let configurationAttempts = 0;
const maxAttempts = 3;

function configureAirStateRobust() {
  if (typeof window === "undefined" || !APP_ID) return false;
  
  configurationAttempts++;
  console.log(`🔧 AirState configuration attempt ${configurationAttempts}/${maxAttempts}`);
  
  try { 
    configure({ 
      appId: APP_ID,
      // Add any additional configuration options that might help
    }); 
    console.log("✅ AirState configured successfully");
    
    // Setup WebSocket monitoring and recovery for Vercel deployment
    setupWebSocketMonitoring();
    setupVisibilityRecovery();
    setupNetworkRecovery();
    
    // Check AirState service health
    setTimeout(() => checkAirStateHealth(), 2000);
    
    console.log("🔧 WebSocket recovery systems enabled for production");
    
    return true;
  } catch (error) {
    console.error(`❌ AirState configuration failed (attempt ${configurationAttempts}):`, error);
    
    if (configurationAttempts < maxAttempts) {
      console.log("🔄 Retrying AirState configuration in 3 seconds...");
      setTimeout(() => configureAirStateRobust(), 3000);
    } else {
      console.error("❌ All AirState configuration attempts failed");
    }
    return false;
  }
}

if (typeof window !== "undefined" && APP_ID) {
  // Initial configuration with retry logic
  configureAirStateRobust();
} else if (typeof window !== "undefined") {
  console.error("❌ AirState APP_ID is missing! Environment variables:", {
    NEXT_PUBLIC_AIRSTATE_APP_ID: process.env.NEXT_PUBLIC_AIRSTATE_APP_ID,
    NODE_ENV: process.env.NODE_ENV
  });
}
// ----------------------------------------

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

export function TodoProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  // read optional ?roomKey from URL; otherwise create one
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const joiningKey = params?.get("roomKey") ?? undefined
  const [roomKey] = useState(() => joiningKey || nanoid())

  // stable per-room user id
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

  // shared state keyed by room
  const [state, setState, isConnected] = useSharedState<SharedState>(defaultSharedState, { key: roomKey })

  // add self to presence (don’t gate on isConnected; it can lag in prod)
  useEffect(() => {
    if (!currentUser || state.users[userId]) return
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
  }, [currentUser, userId, state.users, setState])

  // heartbeat every 10s (also not gated on isConnected)
  useEffect(() => {
    if (!currentUser) return
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
  }, [currentUser, userId, setState])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      setState(prev => {
        const { [userId]: _removed, ...users } = prev.users
        return { ...prev, users }
      })
    }
  }, [setState, userId])

  // task ops
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

  // push roomKey into URL when a user joins (and on restore)
  const pushKeyToUrl = useCallback(() => {
    if (typeof window === "undefined") return
    const hasKey = new URLSearchParams(window.location.search).has("roomKey")
    if (!hasKey) router.replace(`${window.location.pathname}?roomKey=${roomKey}`, { scroll: false })
  }, [router, roomKey])

  const setCurrentUser = useCallback((user: Omit<User, "id"> | null) => {
    if (user) {
      const fixed: User = { ...user, id: userId }
      setCurrentUserState(fixed)
      localStorage.setItem("collaborative-todo-user", JSON.stringify(fixed))
      pushKeyToUrl()
    } else {
      setCurrentUserState(null)
      localStorage.removeItem("collaborative-todo-user")
      setState(prev => {
        const edits = { ...prev.live.edits }
        delete edits[userId]
        return { ...prev, live: { ...prev.live, edits } }
      })
    }
  }, [userId, setState, pushKeyToUrl])

  // restore saved user
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

  // live-edit helpers
  const startLiveEdit = useCallback((taskId: string, text: string, caret: number) => {
    if (!currentUser) return
    setState(prev => ({
      ...prev,
      live: {
        ...prev.live,
        edits: {
          ...prev.live.edits,
          [userId]: {
            taskId, userId, text, caret,
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
            taskId, userId, text, caret,
            name: currentUser.name,
            initials: currentUser.initials ?? "",
            color: currentUser.color,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    }))
  }, [setState, userId, currentUser])

  const endLiveEdit = useCallback(() => {
    setState(prev => {
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
