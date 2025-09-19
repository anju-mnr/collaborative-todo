"use client"

import { useState, useEffect, useRef } from "react"
import { useTodo } from "@/app/contexts/TodoContext"
import { generateUserColor, generateInitials, generateId } from "@/app/lib/utils"
import { TaskList } from "@/app/components/TaskList"
import { AddTaskForm } from "@/app/components/AddTaskForm"
import { PresenceBar } from "@/app/components/PresenceBar"
import { ConnectionStatus } from "@/app/components/ConnectionStatus"
import { UserPlus } from "lucide-react"
import type { User } from "@/app/types"

export default function Home() {
  const [userName, setUserName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const currentUserIdRef = useRef<string | null>(null)

  const {
    state,
    isConnected,
    currentUser,
    addTask: addTaskToState,
    updateTask,
    deleteTask: deleteTaskFromState,
    setUser,
    removeUser,
    setCurrentUser,
  } = useTodo()

  const isJoined = currentUser !== null

  useEffect(() => {
    return () => {
      if (currentUserIdRef.current) {
        removeUser(currentUserIdRef.current)
      }
    }
  }, [removeUser])

  const joinSession = async (name: string) => {
    const trimmedName = name.trim()

    // Validation
    if (!trimmedName) {
      setError("Please enter your name")
      return
    }

    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters long")
      return
    }

    if (trimmedName.length > 20) {
      setError("Name must be less than 20 characters")
      return
    }

    // Check if name is already taken
    const existingUser = Object.values(state.users).find(
      (user) => user.name.toLowerCase() === trimmedName.toLowerCase(),
    )

    if (existingUser) {
      setError("This name is already taken. Please choose a different name.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      const user: User = {
        id: generateId(),
        name: trimmedName,
        color: generateUserColor(),
        initials: generateInitials(trimmedName),
        isActive: true,
        lastSeen: new Date(),
      }

      setCurrentUser(user)
      currentUserIdRef.current = user.id
      setUser(user.id, user)
    } catch {
      setError("Failed to join session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (currentUser) {
      removeUser(currentUser.id)
      setCurrentUser(null)
      currentUserIdRef.current = null
      setUserName("")
      setError("")
    }
  }

  // Add new task
  const addTask = (text: string) => {
    if (!currentUser) return

    addTaskToState({
      text: text.trim(),
      completed: false,
      createdBy: currentUser.id,
    })
  }

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId)
    if (task) {
      updateTask(taskId, { completed: !task.completed })
    }
  }

  // Delete task
  const deleteTask = (taskId: string) => {
    deleteTaskFromState(taskId)
  }

  // Show join form if not joined
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">Join Collaborative To-Do</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Enter your name to start collaborating</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value)
                  if (error) setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userName.trim() && !isLoading) {
                    joinSession(userName)
                  }
                }}
                placeholder="Enter your name (2-20 characters)"
                className={`w-full px-3 py-2 border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                  error ? "border-destructive" : "border-input"
                }`}
                disabled={isLoading}
                maxLength={20}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <button
              onClick={() => joinSession(userName)}
              disabled={!userName.trim() || isLoading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Join Session
                </>
              )}
            </button>

            {Object.keys(state.users).length > 0 && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  {Object.keys(state.users).length} {Object.keys(state.users).length === 1 ? "person is" : "people are"}{" "}
                  currently online
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">Collaborative To-Do</h1>
              <ConnectionStatus isConnected={isConnected} />
            </div>
            <div className="flex justify-center sm:justify-end">
              <PresenceBar users={Object.values(state.users)} currentUser={currentUser} onLogout={logout} />
            </div>
          </div>

          <AddTaskForm onAddTask={addTask} />
        </div>

        {/* Task List */}
        <TaskList
          tasks={state.tasks}
          users={state.users}
          currentUser={currentUser}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />
      </div>
    </div>
  )
}
