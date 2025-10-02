"use client"

import { useState, useEffect } from "react"
import { Copy, Users, UserPlus, ExternalLink } from "lucide-react"
import { useTodo } from "@/app/contexts/TodoContext"
import { generateUserColor, generateInitials } from "@/app/lib/airstate"
import { TaskList } from "@/app/components/TaskList"
import { AddTaskForm } from "@/app/components/AddTaskForm"
import { PresenceBar } from "@/app/components/PresenceBar"
import { ConnectionStatus } from "@/app/components/ConnectionStatus"
import type { User } from "@/app/types"

export default function Home() {
  const [userName, setUserName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [currentView, setCurrentView] = useState<"tasks" | "archive">("tasks") // Added view state

  const {
  state,
  isConnected,
  currentUser,
  roomKey,
  joinLink,
  addTask: addTaskToState,
  updateTask,
  deleteTask: deleteTaskFromState,
  setCurrentUser,
  startLiveEdit,
  pushLiveEdit,
  endLiveEdit,
} = useTodo()

  const isJoined = currentUser !== null
  const activeUsers = Object.values(state.users).filter(u => {
    const freshMs = 30_000; // 30s window
    const last = new Date(u.lastSeen).getTime();
    return u.isActive && Date.now() - last < freshMs;
  });

  // Show connection status while syncing
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Connecting to room...</p>
        </div>
      </div>
    )
  }

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

      // Create user object without id (it will be added in context)
      const user = {
        name: trimmedName,
        color: generateUserColor(),
        initials: generateInitials(trimmedName),
        isActive: true,
        lastSeen: new Date().toISOString(),
      } // no id needed
      setCurrentUser(user)

    } catch {
      setError("Failed to join session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (currentUser) {
      setCurrentUser(null)
      setUserName("")
      setError("")
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy link:', e)
    }
  }

  // page.tsx
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
                className={`w-full px-3 py-2 border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${error ? "border-destructive" : "border-input"
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

          {/* Room Info & Sharing */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Room: {roomKey.slice(0, 8)}...</span>
                <span>•</span>
                <span>{activeUsers.length} active {activeUsers.length === 1 ? 'user' : 'users'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                readOnly
                value={joinLink}
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md"
                placeholder="Room link"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {linkCopied ? (
                  <>
                    <span className="text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span className="text-xs hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={() => window.open(joinLink, '_blank')}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <ExternalLink size={14} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Share this link with others to collaborate on tasks together
            </p>
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
          onEditTask={(id, text) => updateTask(id, { text })}

          // live-collab
          liveEdits={state?.live?.edits}
          onStartLiveEdit={(taskId, text, caret) => startLiveEdit(taskId, text, caret)}
          onPushLiveEdit={(taskId, text, caret) => pushLiveEdit(taskId, text, caret)}
          onEndLiveEdit={(taskId) => endLiveEdit(taskId)}
        />
      </div>
    </div>
  )
}
