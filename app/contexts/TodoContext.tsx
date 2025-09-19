"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useSharedState } from "@airstate/react"
import { nanoid } from "nanoid"
import type { SharedState, Task, User } from "@/app/types"
import { defaultSharedState, generateUserColor, generateInitials, generateUserId } from "@/app/lib/airstate"

interface TodoContextType {
  state: SharedState
  isConnected: boolean
  currentUser: User | null
  roomKey: string
  joinLink: string
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setCurrentUser: (user: User | null) => void
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

export function TodoProvider({ children }: { children: ReactNode }) {
  const [userId] = useState(() => generateUserId())
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  
  // Get room key from URL parameters or generate new one
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const joiningKey = params?.get('roomKey')
  const [roomKey] = useState(() => joiningKey || nanoid())
  
  const joinLink = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?roomKey=${roomKey}`
    : ''

  // Use airstate's useSharedState for real collaboration
  const [state, setState, isConnected] = useSharedState<SharedState>(defaultSharedState, {
    key: roomKey,
  })

  // Add current user to shared state when connected
  useEffect(() => {
    if (!isConnected || !currentUser || state.users[userId]) return
    
    const userCount = Object.keys(state.users).length
    if (userCount >= 10) return // Limit to 10 users per room
    
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
  }, [isConnected, currentUser, userId, state.users, setState])

  // Update user activity periodically
  useEffect(() => {
    if (!isConnected || !currentUser) return

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
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [isConnected, currentUser, userId, setState])

  // Clean up user on unmount
  useEffect(() => {
    return () => {
      if (isConnected && currentUser) {
        setState((prev) => {
          const { [userId]: removed, ...users } = prev.users
          return {
            ...prev,
            users,
          }
        })
      }
    }
  }, [isConnected, currentUser, setState, userId])

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    if (!currentUser) return
    
    const newTask: Task = {
      ...task,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      createdBy: userId,
    }
    
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }))
  }, [currentUser, userId, setState])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    }))
  }, [setState])

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }))
  }, [setState])

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user)
    if (user) {
      // Store user preference in localStorage
      localStorage.setItem("collaborative-todo-user", JSON.stringify(user))
    } else {
      localStorage.removeItem("collaborative-todo-user")
    }
  }, [])

  // Load saved user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("collaborative-todo-user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUserState(user)
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("collaborative-todo-user")
      }
    }
  }, [])

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
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider")
  }
  return context
}
