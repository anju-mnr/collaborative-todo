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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="textfield"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-500 bg-gray-700 text-gray-100 rounded-xl sm:rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 hover:border-pink-400/70 transition-all text-sm sm:text-base"
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 hover:shadow-lg font-medium text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
      
      <div className="flex items-center justify-center sm:justify-start">
        <div className="text-xs text-gray-400">
          <span className="hidden sm:inline">Press Cmd/Ctrl + Enter to add task</span>
          <span className="sm:hidden">Tap Add or press Enter</span>
        </div>
      </div>
    </form>
  )
}
