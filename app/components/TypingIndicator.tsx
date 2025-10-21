"use client"

import React from "react"
import { PenTool, MessageCircle } from "lucide-react"
import { useTodo } from "@/app/contexts/TodoContext"

interface TypingIndicatorProps {
  context: "new-task" | "edit-task"
  className?: string
}

export default function TypingIndicator({ context, className = "" }: TypingIndicatorProps) {
  const { getTypingUsers } = useTodo()
  const typingUsers = getTypingUsers(context)

  if (typingUsers.length === 0) {
    return null
  }

  const renderTypingText = () => {
    if (typingUsers.length === 1) {
      return (
        <span className="text-sm text-gray-400">
          <strong style={{ color: typingUsers[0].color }}>{typingUsers[0].name}</strong> is typing...
        </span>
      )
    } else if (typingUsers.length === 2) {
      return (
        <span className="text-sm text-gray-400">
          <strong style={{ color: typingUsers[0].color }}>{typingUsers[0].name}</strong> and{" "}
          <strong style={{ color: typingUsers[1].color }}>{typingUsers[1].name}</strong> are typing...
        </span>
      )
    } else {
      return (
        <span className="text-sm text-gray-400">
          <strong style={{ color: typingUsers[0].color }}>{typingUsers[0].name}</strong> and{" "}
          <strong>{typingUsers.length - 1} others</strong> are typing...
        </span>
      )
    }
  }

  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-bottom-2 ${className}`}>
      {/* User avatars */}
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className="w-7 h-7 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white shadow-lg transform hover:scale-110 transition-transform animate-in zoom-in-50"
            style={{ 
              backgroundColor: user.color,
              animationDelay: `${index * 100}ms`
            }}
            title={user.name}
          >
            {user.initials}
          </div>
        ))}
        {typingUsers.length > 3 && (
          <div className="w-7 h-7 rounded-full border-2 border-gray-800 bg-gray-600 flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse">
            +{typingUsers.length - 3}
          </div>
        )}
      </div>
      
      {/* Typing text */}
      <div className="animate-in fade-in-50 slide-in-from-left-2">
        {renderTypingText()}
      </div>
    </div>
  )
}