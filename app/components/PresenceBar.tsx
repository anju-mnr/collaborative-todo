"use client"

import { useMemo, useState } from "react"
import { Users } from "lucide-react"
import type { User } from "@/app/types"
import { useTodo } from "@/app/contexts/TodoContext"

interface PresenceBarProps {
  users?: User[]
  currentUser?: User | null
  onLogout?: () => void
  usePresenceHook?: boolean // NEW: whether to use the presence hook from context
}

export function PresenceBar({ users, currentUser, onLogout, usePresenceHook = false }: PresenceBarProps) {
  const [open, setOpen] = useState(false)
  
  // Get presence data from context if using the hook
  const todoContext = useTodo()

  const activeUsers = useMemo(() => {
    // Choose data source inside useMemo to avoid dependencies changing
    const finalUsers = usePresenceHook ? todoContext.presenceUsers : users || []
    
    const FRESHNESS_MS = 30_000 // 30 seconds
    const now = Date.now()

    // 1) filter by active + recent heartbeat
    const filtered = finalUsers.filter(u => {
      if (!u?.isActive) return false
      if (!u?.lastSeen) return true
      const last = new Date(u.lastSeen).getTime()
      return now - last < FRESHNESS_MS
    })

    // 2) de-dupe by name
    const byName = new Map<string, User>()
    for (const u of filtered) {
      if (u?.name && !byName.has(u.name)) {
        byName.set(u.name, u)
      }
    }
    return Array.from(byName.values())
  }, [usePresenceHook, todoContext.presenceUsers, users])

  // Choose current user data source
  const finalCurrentUser = usePresenceHook ? todoContext.currentUser : currentUser

  const meId = finalCurrentUser?.id
  const me = activeUsers.find(u => u.id === meId) ?? finalCurrentUser ?? null
  const others = activeUsers.filter(u => u.id !== meId)
  const total = (me ? 1 : 0) + others.length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-white/30 bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 text-white text-sm"
        title="Active members"
      >
        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm font-medium">{total}</span>
        {me && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 border-2 border-blue-400/50 rounded-2xl shadow-2xl shadow-purple-500/25 p-5 z-[9999] max-h-96 overflow-y-auto backdrop-blur-lg">
          {/* Header */}
          <div className="text-lg font-bold mb-4 text-white">
            Active Members ({total})
          </div>

          {/* Me */}
          {me && (
            <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/15 transition-colors duration-200 mb-3 bg-blue-500/30 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full text-xs text-white flex items-center justify-center font-semibold shadow-lg ring-2 ring-white/30"
                  style={{ backgroundColor: me.color }}
                >
                  {me.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{me.name}</span>
                  <span className="text-xs bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-medium">(You)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse shadow-lg" title="Active" />
                <span className="text-xs text-green-300 font-medium">Online</span>
              </div>
            </div>
          )}

          {/* Others */}
          <div className="space-y-2">
            {others.map(u => (
              <div key={u.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/15 transition-colors duration-200 bg-blue-500/20 backdrop-blur-sm border border-white/15 hover:border-white/25">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full text-xs text-white flex items-center justify-center font-semibold shadow-lg ring-2 ring-white/20"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{u.name}</span>
                    <span className="text-xs text-white/70">Collaborator</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg" title="Active" />
                  <span className="text-xs text-green-300 font-medium">Online</span>
                </div>
              </div>
            ))}
          </div>
          
          {onLogout && me && (
            <>
              <hr className="border-t border-white/20 my-4" />
              <button
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
                className="w-full text-sm text-orange-300 hover:text-white hover:bg-orange-500/20 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium border border-orange-400/30 hover:border-orange-400/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Leave Session
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
