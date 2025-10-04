"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
  isReconnecting?: boolean
}

export function ConnectionStatus({ isConnected, isReconnecting = false }: ConnectionStatusProps) {
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    if (!isConnected || isReconnecting) {
      setShowStatus(true)
    } else {
      // Hide status after a brief delay when connected
      const timer = setTimeout(() => setShowStatus(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isConnected, isReconnecting])

  if (!showStatus) return null

  return (
    <div
      className={`fixed flex items-center justify-center top-2 right-[50%] z-50 px-3 py-2 rounded-lg shadow-lg border transition-all ${
        isConnected && !isReconnecting
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-yellow-50 border-yellow-200 text-yellow-800"
      }`}
    >
      <div className="flex items-center justify-center gap-2 text-sm">
        {isReconnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Reconnecting...</span>
          </>
        ) : isConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Disconnected</span>
          </>
        )}
      </div>
    </div>
  )
}
