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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
        <div className="text-center space-y-6 bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20 shadow-2xl">
          {/* Gradient Spinner */}
          <div className="relative mx-auto w-16 h-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 p-1">
              <div className="rounded-full h-full w-full bg-white/10 backdrop-blur-lg"></div>
            </div>
            <div className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-30"></div>
          </div>

          {/* Gradient Text */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
              Connecting to room...
            </h3>
            <p className="text-white/80 text-sm">
              Please wait while we establish the connection
            </p>
          </div>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 glass-card p-8 rounded-3xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center float-animation backdrop-blur-sm border border-white/30">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-balance">Join Collaborative To-Do</h1>
            <p className="text-white/80 text-sm sm:text-base">Enter your name to start collaborating</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white">
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
                className={`w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all ${error ? "border-red-400" : "border-white/30"
                  }`}
                disabled={isLoading}
                maxLength={20}
              />
              {error && <p className="text-sm text-red-300">{error}</p>}
            </div>

            <button
              onClick={() => joinSession(userName)}
              disabled={!userName.trim() || isLoading}
              className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                <p className="text-xs text-white/70">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8  max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl relative z-50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
                  Collaborative To-Do
                </h1>
                <ConnectionStatus isConnected={isConnected} />
              </div>
              <div className="flex justify-center sm:justify-end">
                <PresenceBar users={Object.values(state.users)} currentUser={currentUser} onLogout={logout} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">

            <div className="col-span-2 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-6">
              <AddTaskForm onAddTask={addTask} />
            </div>

            {/* Room Info & Sharing */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                  <Users className="w-4 h-4" />
                  <span>Room: {roomKey.slice(0, 8)}...</span>
                  {/* <span>•</span>
                  <span>{activeUsers.length} active {activeUsers.length === 1 ? 'user' : 'users'}</span> */}
                </div>
              </div>

              <div className="flex gap-1">
                <input
                  readOnly
                  value={joinLink}
                  className="flex-1 px-3 py-2 text-sm bg-white/25 border border-white/40 text-white font-medium placeholder-white/70 rounded-3xl backdrop-blur-sm"
                  placeholder="Room link"
                />
                <button
                  onClick={copyLink}
                  className="px-3 py-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white rounded-lg transition-all flex items-center gap-1 hover:shadow-lg font-medium"
                >
                  {linkCopied ? (
                    <>
                      <span className="text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      {/* <span className="text-xs hidden sm:inline">Copy</span> */}
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.open(joinLink, '_blank')}
                  className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all backdrop-blur-sm border border-white/30"
                >
                  <ExternalLink size={14} />
                </button>
              </div>

              <p className="text-xs text-white/90 font-medium">
                Share this link with others to collaborate on tasks together
              </p>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-6">
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
    </div>
  )
}
