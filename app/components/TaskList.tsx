"use client"

import React, { useRef, useState } from "react"
import { Check, Trash2, Clock, Users, Pencil, X } from "lucide-react"
import type { Task, User as UserType } from "@/app/types"
import { motion, AnimatePresence } from "framer-motion"
interface TaskListProps {
  tasks: Task[]
  users: Record<string, UserType>
  currentUser: UserType | null
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onEditTask: (taskId: string, newText: string) => void

  // Live-collab props
  liveEdits: Record<string, {
    taskId: string
    userId: string
    text: string
    caret: number
    name: string
    initials: string
    color: string
    updatedAt: string
  }>
  onStartLiveEdit: (taskId: string, text: string, caret: number) => void
  onPushLiveEdit: (taskId: string, text: string, caret: number) => void
  onEndLiveEdit: (taskId: string) => void
}

function renderGhostText(draft: string, caret: number) {
  const before = draft?.slice(0, caret)
  const after = draft?.slice(caret)
  return (
    <span className="font-medium">
      <span>{before}</span>
      {/* caret */}
      <span className="inline-block w-0.5 h-4 align-text-bottom animate-pulse bg-current mx-0.5 rounded" />
      <span className="opacity-70">{after}</span>
    </span>
  )
}

export function TaskList({
  tasks,
  users,
  currentUser,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  liveEdits,
  onStartLiveEdit,
  onPushLiveEdit,
  onEndLiveEdit,
}: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const rafRef = useRef<number | null>(null)

  const systemTasks = tasks.filter(t => t.createdBy === "system")
  const allTasks = tasks.filter(t => t.createdBy !== "system")

  const sortTasks = (list: Task[]) =>
    [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const sortedTasks = sortTasks(allTasks)
  const sortedSystemTasks = sortTasks(systemTasks)

  // enter edit mode
  const startEditing = (task: Task) => {
    setEditingId(task.id)
    setDraft(task.text)
    onStartLiveEdit(task.id, task.text, task.text.length)
  }

  // save (works via Enter OR clicking ✓)
  const commitEdit = (taskId: string) => {
    const text = draft.trim()
    if (!text) return
    onEditTask(taskId, text)
    onEndLiveEdit(taskId)   // end live here
    setEditingId(null)
    setDraft("")
  }

  const cancelEditing = () => {
    if (editingId) onEndLiveEdit(editingId) // end live here
    setEditingId(null)
    setDraft("")
  }

  const TaskSection = ({ title, tasks, icon }: { title: string; tasks: Task[]; icon: React.ReactNode }) => {
    if (tasks.length === 0) return null

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
          {icon}
          <span>{title}</span>
          <span className="text-xs bg-gradient-to-r from-blue-500 to-pink-500 text-white px-2 py-0.5 rounded-full shadow-lg">{tasks.length}</span>
        </div>

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {tasks.map((task) => {
              const creator = users[task.createdBy]
              const isMyTask = task.createdBy === currentUser?.id
              const isEditing = editingId === task.id

              // choose a fresh ghost (hide if stale or equals saved text)
              const now = Date.now()
              const TTL = 4000
              const ghosts = Object.values(liveEdits).filter(le =>
                le.taskId === task.id &&
                le.userId !== currentUser?.id &&
                now - new Date(le.updatedAt).getTime() < TTL &&
                le.text !== task.text
              )
              // render the first ghost’s text in the title (so you see the ACTUAL live text)
              const firstGhost = ghosts[0]

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  whileHover={{ scale: isEditing ? 1 : 1.02 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className={`group bg-gray-700/80 backdrop-blur-lg border-2 border-gray-500 text-gray-100 rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5 shadow-xl hover:shadow-2xl hover:bg-gray-700/90 hover:border-blue-400/70 transition-all duration-300 ${task.completed ? "opacity-60 hover:opacity-70" : ""} ${isMyTask ? "border-l-4 sm:border-l-6 border-l-pink-400 shadow-2xl bg-gray-700/90 ring-2 ring-pink-400/50 border-pink-400/60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button 
                      onClick={() => onToggleTask(task.id)} 
                      className="relative rounded-md border-2 transition-all duration-300 mt-0.5 flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: '20px',
                        height: '20px',
                        minWidth: '20px',
                        minHeight: '20px',
                        maxWidth: '20px',
                        maxHeight: '20px',
                        background: task.completed 
                          ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)'
                          : '#374151',
                        borderColor: task.completed 
                          ? '#ec4899' 
                          : '#6b7280',
                        boxShadow: task.completed 
                          ? '0 0 15px rgba(236, 72, 153, 0.5)' 
                          : 'none',
                      }}
                    >
                      {task.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" strokeWidth={2} />
                        </motion.div>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        // === Edit mode ===
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={draft}
                            onChange={(e) => {
                              setDraft(e.target.value)
                              const caret = (e.target as HTMLInputElement).selectionStart ?? e.target.value.length
                              if (rafRef.current) cancelAnimationFrame(rafRef.current)
                              rafRef.current = requestAnimationFrame(() => {
                                onPushLiveEdit(task.id, e.target.value, caret)
                              })
                            }}
                            onSelect={(e) => {
                              const caret = (e.target as HTMLInputElement).selectionStart ?? 0
                              onPushLiveEdit(task.id, draft, caret)
                            }}

                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                e.preventDefault()
                                cancelEditing()
                              }
                              if (e.key === "Enter") {
                                e.preventDefault()
                                commitEdit(task.id)
                              }
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-500 bg-gray-800 text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                          />

                          <button
                            type="button"
                            data-role="edit-save"
                            onMouseDown={(e) => {
                              e.preventDefault()      // stops the input from blurring first
                              commitEdit(task.id)
                            }}
                            className="px-2 py-1 rounded-lg border-2 border-gray-500 text-gray-300 hover:bg-green-600 hover:border-green-400 hover:text-white transition-all"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          {/* Cancel: same trick */}
                          <button
                            type="button"
                            data-role="edit-cancel"
                            onMouseDown={(e) => {
                              e.preventDefault()      // stops the input from blurring first
                              cancelEditing()
                            }}
                            className="px-2 py-1 rounded-lg border-2 border-gray-500 text-gray-300 hover:bg-red-600 hover:border-red-400 hover:text-white transition-all"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // === Read mode ===
                        <>
                          {/* Title row: left = text (with live caret if any), right = Created by … */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`pr-40 font-medium text-sm sm:text-base text-gray-100 ${task.completed ? "line-through text-gray-400" : ""}`}>
                              {firstGhost ? renderGhostText(firstGhost.text, firstGhost.caret) : task.text}
                            </h3>

                          </div>

                          {/* Floating typing indicator under the title (avatar + dots) */}
                          {ghosts.length > 0 && (
                            <div className="mt-1 text-xs flex items-center gap-2">
                              {ghosts.map(le => (
                                <div key={le.userId} className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center"
                                    style={{ backgroundColor: le.color }}
                                    title={le.name}
                                  >
                                    {le.initials}
                                  </div>
                                  {/* three bouncing dots */}
                                  <span className="inline-flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 animate-bounce shadow-sm" />
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-bounce [animation-delay:120ms] shadow-sm" />
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-pink-600 animate-bounce [animation-delay:240ms] shadow-sm" />
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Timestamp row */}
                          <div className="flex items-center justify-between gap-1 sm:gap-2 mt-2 text-xs text-gray-400 font-medium">
                            <span className="hidden sm:inline">{new Date(task.createdAt).toLocaleTimeString()}</span>
                            <span className="sm:hidden">
                              {new Date(task?.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {/* Created by badge in the top-right */}
                            {creator && task.createdBy !== "system" && (
                              <div
                                className="flex items-center gap-1 text-xs text-gray-300 font-medium"
                                title={`Created by ${isMyTask ? "you" : creator.name}`}
                              >
                                <div
                                  className="w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center"
                                  style={{ backgroundColor: creator.color }}
                                >
                                  {creator.initials}
                                </div>
                                <span>Created by {isMyTask ? "you" : creator.name}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {isMyTask && task?.createdBy !== "system" && !isEditing && (
                        <button
                          onClick={() => startEditing(task)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-md transition-all"
                          title="Edit task"
                        >
                          <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                      {(isMyTask || task?.createdBy === "system") && (
                        <button
                          onClick={() => onDeleteTask(task?.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-pink-400 hover:bg-pink-600/20 rounded-md transition-all"
                          title="Delete task"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div >
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Clock className="w-8 h-8 text-white/90" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No tasks yet</h3>
        <p className="text-white/90 font-medium">Add your first task to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TaskSection title="Getting Started" tasks={sortedSystemTasks} icon={<Clock className="w-4 h-4" />} />
      <TaskSection title="All Tasks" tasks={sortedTasks} icon={<Users className="w-4 h-4" />} />
    </div>
  )
}
