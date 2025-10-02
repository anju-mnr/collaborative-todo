"use client"

import React, { useRef, useState } from "react"
import { Check, Trash2, Clock, Users, Pencil, X } from "lucide-react"
import type { Task, User as UserType } from "@/app/types"

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

  const systemTasks = tasks?.filter(t => t.createdBy === "system")
  const allTasks = tasks?.filter(t => t.createdBy !== "system")

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
    onEndLiveEdit(taskId)
    setEditingId(null)
    setDraft("")
  }

  const cancelEditing = () => {
    if (editingId) onEndLiveEdit(editingId)
    setEditingId(null)
    setDraft("")
  }

  const TaskSection = ({ title, tasks, icon }: { title: string; tasks: Task[]; icon: React.ReactNode }) => {
    if (tasks.length === 0) return null

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{tasks.length}</span>
        </div>

        <div className="space-y-2">
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
              <div
                key={task.id}
                className={`group bg-card border border-border rounded-lg p-3 sm:p-4 transition-all hover:shadow-md
                  ${task.completed ? "opacity-60" : ""} ${isMyTask ? "border-l-4 border-l-primary" : ""}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 transition-all ${
                      task.completed
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {task.completed && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 m-auto" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      // === Edit mode ===
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => { e.preventDefault(); commitEdit(task.id) }}
                      >
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
                            const caret = (e?.target as HTMLInputElement).selectionStart ?? 0
                            onPushLiveEdit(task.id, draft, caret)
                          }}
                          onBlur={() => {
                            // keep editing UI; just stop broadcasting if they tab away
                            onEndLiveEdit(task.id)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") cancelEditing()
                          }}
                          className="w-full px-3 py-2 border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        />

                        <button
                          type="submit"                // ✅ clicking ✓ submits form
                          className="px-2 py-1 rounded-md border hover:bg-muted"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-2 py-1 rounded-md border hover:bg-muted"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      // === Read mode ===
                      <>
                        {/* Title row: left = text (with live caret if any), right = Created by … */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-medium text-sm sm:text-base text-card-foreground ${task.completed ? "line-through" : ""}`}>
                            {firstGhost ? renderGhostText(firstGhost.text, firstGhost.caret) : task.text}
                          </h3>

                          {/* Created by badge in the top-right */}
                          {creator && task.createdBy !== "system" && (
                            <div
                              className="flex items-center gap-1 text-xs text-muted-foreground"
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
                                <span className="inline-flex items-center gap-1 opacity-70">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:120ms]" />
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:240ms]" />
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Timestamp row */}
                        <div className="flex items-center gap-1 sm:gap-2 mt-2 text-xs text-muted-foreground">
                          <span className="hidden sm:inline">{new Date(task.createdAt).toLocaleTimeString()}</span>
                          <span className="sm:hidden">
                            {new Date(task?.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {isMyTask && task?.createdBy !== "system" && !isEditing && (
                      <button
                        onClick={() => startEditing(task)}
                        className="flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all"
                        title="Edit task"
                      >
                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                    {(isMyTask || task?.createdBy === "system") && (
                      <button
                        onClick={() => onDeleteTask(task?.id)}
                        className="flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
        <p className="text-muted-foreground">Add your first task to get started!</p>
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
