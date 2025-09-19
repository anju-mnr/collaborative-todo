"use client"

import { useState, useEffect } from "react"
import { realtimeClient } from "@/app/lib/realtime"
import type { SharedState } from "@/app/types"

export function useRealtime() {
  const [state, setState] = useState<SharedState>(realtimeClient.getState())
  const [isConnected] = useState(true) // Mock connection status

  useEffect(() => {
    const unsubscribe = realtimeClient.subscribe(setState)
    return unsubscribe
  }, [])

  return {
    state,
    isConnected,
    addTask: realtimeClient.addTask.bind(realtimeClient),
    updateTask: realtimeClient.updateTask.bind(realtimeClient),
    deleteTask: realtimeClient.deleteTask.bind(realtimeClient),
    setUser: realtimeClient.setUser.bind(realtimeClient),
    removeUser: realtimeClient.removeUser.bind(realtimeClient),
  }
}
