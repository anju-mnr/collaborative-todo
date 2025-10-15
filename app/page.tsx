"use client"

import { useState } from "react"
import { Copy, Users, UserPlus, ExternalLink } from "lucide-react"
import { useTodo } from "@/app/contexts/TodoContext"
import { generateUserColor, generateInitials } from "@/app/lib/airstate"
import { TaskList } from "@/app/components/TaskList"
import { AddTaskForm } from "@/app/components/AddTaskForm"
import { PresenceBar } from "@/app/components/PresenceBar"
import { ConnectionStatus } from "@/app/components/ConnectionStatus"

export default function Home() {
  const [userName, setUserName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [linkCopied, setLinkCopied] = useState(false)

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

  const joinSession = async (name: string) => {
    const trimmedName = name.trim()

    if (!trimmedName) return setError("Please enter your name")
    if (trimmedName.length < 2) return setError("Name must be at least 2 characters long")
    if (trimmedName.length > 20) return setError("Name must be less than 20 characters")

    const existingUser = Object.values(state.users).find(
      (user) => user.name.toLowerCase() === trimmedName.toLowerCase(),
    )
    if (existingUser) return setError("This name is already taken. Please choose a different name.")

    setIsLoading(true); setError("")
    try {
      await new Promise((r) => setTimeout(r, 300))
      setCurrentUser({
        name: trimmedName,
        color: generateUserColor(),
        initials: generateInitials(trimmedName),
        isActive: true,
        lastSeen: new Date().toISOString(),
      })
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
      console.error("Failed to copy link:", e)
    }
  }

  const addTask = (text: string) => {
    if (!currentUser) return
    addTaskToState({
      text: text.trim(),
      completed: false,
      createdBy: currentUser.id,
    })
  }

  const toggleTask = (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId)
    if (task) updateTask(taskId, { completed: !task.completed })
  }

  const deleteTask = (taskId: string) => deleteTaskFromState(taskId)

  // ---------------------------
  // JOIN VIEW
  // ---------------------------
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-4 sm:space-y-6 bg-gray-800/90 backdrop-blur-lg p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-blue-500/60 ring-2 ring-pink-500/40 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-700/80 flex items-center justify-center float-animation backdrop-blur-sm border-2 border-blue-400/60 ring-1 ring-pink-400/40">
              <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-300" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Join Collaborative To-Do</h1>
            <p className="text-gray-300 text-sm sm:text-base">Enter your name to start collaborating</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-200">Your Name</label>
              <input
                id="name"
                type="text"
                value={userName}
                onChange={(e) => { setUserName(e.target.value); if (error) setError("") }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userName.trim() && !isLoading) {
                    joinSession(userName)
                  }
                }}
                placeholder="Enter your name (2–20 characters)"
                className={`w-full px-4 py-3 bg-gray-700 border-2 border-gray-500 text-gray-100 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 hover:border-pink-400/70 transition-all ${error ? "border-red-400" : "border-gray-500"}`}
                disabled={isLoading}
                maxLength={20}
              />
              {error && <p className="text-sm text-red-300">{error}</p>}
            </div>

            <button
              onClick={() => joinSession(userName)}
              disabled={!userName.trim() || isLoading}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white py-3 px-4 rounded-xl border-2 border-white/20 ring-2 ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] hover:ring-pink-500/40 active:scale-[0.98] active:ring-blue-500/50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining…
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
                <p className="text-xs text-blue-300/80 font-medium">
                  {Object.keys(state.users).length} {Object.keys(state.users).length === 1 ? "person is" : "people are"} currently online
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------
  // MAIN APP
  // ---------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 space-y-3 sm:space-y-4">
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl relative z-50 p-4 sm:p-6 border-2 border-blue-500/60 ring-2 ring-pink-500/40">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex flex-col">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Collaborative To-Do
                  </h1>
                </div>
                <ConnectionStatus isConnected={isConnected} />
              </div>
              <div className="flex justify-start sm:justify-end">
                <PresenceBar usePresenceHook={true} onLogout={logout} />
              </div>
            </div>
          </div>

          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Add Task Form - Full width on mobile, 2/3 on desktop */}
            <div className="lg:col-span-2 bg-gray-800/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 border-2 border-blue-500/60 ring-2 ring-pink-500/40">
              <AddTaskForm onAddTask={addTask} />
            </div>

            {/* Room Info & Sharing - Full width on mobile, 1/3 on desktop */}
            <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 border-2 border-blue-500/60 ring-2 ring-pink-500/40">
              <div className="flex flex-row items-center">
                <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                  <Users className="w-4 h-4" />
                  <span>Room: {roomKey.slice(0, 8)}...</span>
                </div>
                <button
                  onClick={() => window.open(joinLink, "_blank")}
                  className="px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-blue-400 transition-all rounded-lg"
                >
                  <ExternalLink size={16} />
                </button>
              </div>

              <div className="flex flex-row gap-2">
                <input
                  readOnly
                  value={joinLink}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-gray-700 border-2 border-gray-500 text-gray-200 font-medium placeholder-gray-400 rounded-xl truncate focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  placeholder="Room link"
                />
                <button
                  onClick={copyLink}
                  className="px-3 py-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white rounded-xl transition-all flex items-center justify-center gap-1 hover:shadow-lg font-medium text-sm whitespace-nowrap"
                >
                  {linkCopied ? (
                    <span className="text-xs">Copied!</span>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Share this link with others to collaborate
              </p>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 border-2 border-blue-500/60 ring-2 ring-pink-500/40">
          <TaskList
            tasks={state.tasks}
            users={state.users}
            currentUser={currentUser}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onEditTask={(id, text) => updateTask(id, { text })}
            liveEdits={state.live.edits}
            onStartLiveEdit={startLiveEdit}
            onPushLiveEdit={pushLiveEdit}
            onEndLiveEdit={endLiveEdit}
          />
        </div>
      </div>
    </div>
  )
}
