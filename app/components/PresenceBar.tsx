"use client"

import React, { useEffect, useRef, useState } from "react"
import { Users, LogOut, ChevronDown } from "lucide-react"
import { useTodo } from "@/app/contexts/TodoContext"
import type { User } from "@/app/types"

type PresenceBarProps = {
  currentUser: User | null
  onLogout: () => void
}

export default function PresenceBar({ currentUser, onLogout }: PresenceBarProps) {
  const { presenceUsers } = useTodo()

  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // Close on outside click
  useEffect(() => {
    function onDocDown(e: MouseEvent | TouchEvent) {
      if (!open) return
      const target = e.target as Node | null
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocDown)
    document.addEventListener("touchstart", onDocDown, { passive: true })
    return () => {
      document.removeEventListener("mousedown", onDocDown)
      document.removeEventListener("touchstart", onDocDown)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const count = presenceUsers.length

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white"
        title="Active Members"
      >
        <Users className="w-4 h-4" />
        <span>{count}</span>
        <span className="ml-1 inline-block w-2 h-2 rounded-full bg-emerald-400" />
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Popover */}
      {open && (
        <div
          role="menu"
          aria-label="Active Members"
          className="absolute right-0 z-50 mt-2 w-[300px] rounded-xl bg-[#111827] text-white shadow-xl border border-white/10"
        >
          <div className="px-4 pt-3 pb-2 text-white/80 font-semibold">
            Active Members ({count})
          </div>

          <div className="px-3 pb-3 space-y-2 max-h-72 overflow-auto">
            {presenceUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full text-[11px] text-white flex items-center justify-center"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.initials ?? u.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-medium">
                      {u.name} {currentUser?.id === u.id && <span className="text-white/60">(You)</span>}
                    </div>
                    <div className="text-[11px] text-emerald-400">Online</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentUser && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="m-3 w-[calc(100%-1.5rem)] inline-flex items-center justify-center gap-2 text-sm text-white bg-white/10 hover:bg-white/15 rounded-lg py-2"
            >
              <LogOut className="w-4 h-4" />
              Leave Session
            </button>
          )}
        </div>
      )}
    </div>
  )
}
