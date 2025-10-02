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
            type="textfield"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="w-full px-4 py-3 border border-white/30 bg-white/20 text-white rounded-2xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all backdrop-blur-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-3 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 hover:shadow-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/70">
        <span>Press Cmd/Ctrl + Enter to add task</span>
      </div>
    </form>
  )
}
