"use client"

import { useMemo, useState } from "react"
import { Users } from "lucide-react"
import type { User } from "@/app/types"

interface PresenceBarProps {
  users: User[]
  currentUser: User | null
  onLogout?: () => void
}

export function PresenceBar({ users, currentUser, onLogout }: PresenceBarProps) {
  const [open, setOpen] = useState(false)

  const activeUsers = useMemo(() => {
    const FRESHNESS_MS = 30_000 // 30 seconds
    const now = Date.now()

    // 1) filter by active + recent heartbeat
    const filtered = users.filter(u => {
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
  }, [users])

  const meId = currentUser?.id
  const me = activeUsers.find(u => u.id === meId) ?? currentUser ?? null
  const others = activeUsers.filter(u => u.id !== meId)
  const total = (me ? 1 : 0) + others.length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-2 py-1 rounded-md border border-input bg-background hover:bg-muted/50"
        title="Active members"
      >
        <Users className="w-4 h-4" />
        <span className="text-sm">{total}</span>
        {me && <div className="ml-1 w-2 h-2 rounded-full bg-green-500" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-background text-popover-foreground border border-border rounded-md shadow-lg p-3 z-50">
          <div className="text-sm font-medium mb-2">Active Members ({total})</div>

          {/* Me */}
          {me && (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full text-[11px] text-white flex items-center justify-center"
                  style={{ backgroundColor: me.color }}
                >
                  {me.initials}
                </div>
                <span>{me.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">(You)</span>
                <span className="w-2 h-2 rounded-full bg-green-500" title="Active" />
              </div>
            </div>
          )}

          {/* Others */}
          {others.map(u => (
            <div key={u.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full text-[11px] text-white flex items-center justify-center"
                  style={{ backgroundColor: u.color }}
                >
                  {u.initials}
                </div>
                <span>{u.name}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-500" title="Active" />
            </div>
          ))}
          <hr className="border-t border-border mt-2" />

          {onLogout && me && (
            <button
              onClick={onLogout}
              className="mt-2 w-full text-xs text-muted-foreground text-red-600 hover:text-foreground  pt-2"
            >
              Leave Session
            </button>
          )}
        </div>
      )}
    </div>
  )
}
