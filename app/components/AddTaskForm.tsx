"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { useTodo } from "@/app/contexts/TodoContext"
import TypingIndicator from "./TypingIndicator"

interface AddTaskFormProps {
  onAddTask: (text: string) => void
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [text, setText] = useState("")
  const { setTyping, currentUser } = useTodo()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!text.trim()) return

    // Clear typing indicator when submitting
    setTyping("new-task", false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    onAddTask(text)
    setText("")
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    setText(newText)

    if (!currentUser) return

    // Set typing indicator when user starts typing
    if (newText.trim() && !text.trim()) {
      setTyping("new-task", true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (newText.trim()) {
      // Update typing indicator
      setTyping("new-task", true)
      
      // Set timeout to clear typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping("new-task", false)
      }, 2000)
    } else {
      // Clear typing indicator if input is empty
      setTyping("new-task", false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      setTyping("new-task", false)
    }
  }, [setTyping])

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="textfield"
            value={text}
            onChange={handleTextChange}
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
      
      {/* Typing indicator */}
      <TypingIndicator context="new-task" className="min-h-[24px]" />
      
      <div className="flex items-center justify-center sm:justify-start">
        <div className="text-xs text-gray-400">
          <span className="hidden sm:inline">Press Cmd/Ctrl + Enter to add task</span>
          <span className="sm:hidden">Tap Add or press Enter</span>
        </div>
      </div>
    </form>
  )
}
