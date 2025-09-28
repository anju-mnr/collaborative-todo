"use client"

import React, { useState } from "react"
import { Check, Trash2, Clock, User, Users, Pencil, X } from "lucide-react"
import type { Task, User as UserType } from "@/app/types"

interface TaskListProps {
  tasks: Task[]
  users: Record<string, UserType>
  currentUser: UserType | null
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onEditTask: (taskId: string, newText: string) => void
}

export function TaskList({ tasks, users, currentUser, onToggleTask, onDeleteTask, onEditTask }: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")

  const myTasks = tasks.filter((task) => task.createdBy === currentUser?.id)
  const otherTasks = tasks.filter((task) => task.createdBy !== currentUser?.id && task.createdBy !== "system")
  const systemTasks = tasks.filter((task) => task.createdBy === "system")

  const sortTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  const sortedMyTasks = sortTasks(myTasks)
  const sortedOtherTasks = sortTasks(otherTasks)
  const sortedSystemTasks = sortTasks(systemTasks)

  const startEditing = (task: Task) => {
    setEditingId(task.id)
    setDraft(task.text)
  }
  const cancelEditing = () => {
    setEditingId(null)
    setDraft("")
  }
  const commitEdit = (taskId: string) => {
    const text = draft.trim()
    if (!text) return
    onEditTask(taskId, text)
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

            return (
              <div
                key={task.id}
                className={`group bg-card border border-border rounded-lg p-3 sm:p-4 transition-all hover:shadow-md ${
                  task.completed ? "opacity-60" : ""
                } ${isMyTask ? "border-l-4 border-l-primary" : ""}`}
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

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(task.id)
                            if (e.key === "Escape") cancelEditing()
                          }}
                          className="w-full px-3 py-2 border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          onClick={() => commitEdit(task.id)}
                          className="px-2 py-1 rounded-md border hover:bg-muted"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-2 py-1 rounded-md border hover:bg-muted"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3
                          className={`font-medium text-sm sm:text-base text-card-foreground ${
                            task.completed ? "line-through" : ""
                          }`}
                        >
                          {task.text}
                        </h3>

                        {/* Task Meta */}
                        <div className="flex items-center gap-1 sm:gap-2 mt-2 text-xs text-muted-foreground">
                          {creator && task.createdBy !== "system" && (
                            <div className="flex items-center gap-1">
                              <div
                                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                style={{ backgroundColor: creator.color }}
                              >
                                {creator.initials}
                              </div>
                              <span className="hidden xs:inline">{isMyTask ? "by you" : `by ${creator.name}`}</span>
                            </div>
                          )}
                          {creator && task.createdBy !== "system" && <span className="hidden xs:inline">•</span>}
                          <span className="hidden sm:inline">{new Date(task.createdAt).toLocaleTimeString()}</span>
                          <span className="sm:hidden">
                            {new Date(task.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions (Edit/Delete) */}
                  <div className="flex items-center gap-1">
                    {/* Edit only for my tasks (not system) */}
                    {isMyTask && task.createdBy !== "system" && !isEditing && (
                      <button
                        onClick={() => startEditing(task)}
                        className="flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all"
                        title="Edit task"
                      >
                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                    {/* Delete: my tasks or system tasks */}
                    {(isMyTask || task.createdBy === "system") && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
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
      <TaskSection title="My Tasks" tasks={sortedMyTasks} icon={<User className="w-4 h-4" />} />
      <TaskSection title="Team Tasks" tasks={sortedOtherTasks} icon={<Users className="w-4 h-4" />} />
    </div>
  )
}
