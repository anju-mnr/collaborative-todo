"use client"

import type React from "react"
import { useState } from "react"
import { Plus } from "lucide-react"

interface AddTaskFormProps {
  onAddTask: (text: string) => void
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [text, setText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!text.trim()) return

    onAddTask(text)
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Press Cmd/Ctrl + Enter to add task</span>
      </div>
    </form>
  )
}
