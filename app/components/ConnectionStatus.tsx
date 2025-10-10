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
      const timer = setTimeout(() => setShowStatus(false), 3000) // Longer delay to see success
      return () => clearTimeout(timer)
    }
  }, [isConnected, isReconnecting])

  // Always show status in development for debugging
  const shouldShow = showStatus || (process.env.NODE_ENV === 'development')

  if (!shouldShow) return null

  return (
    <div
      className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg border transition-all ${
        isConnected && !isReconnecting
          ? "bg-green-600/20 border-green-400/50 text-green-300 ring-1 ring-green-400/30"
          : "bg-yellow-600/20 border-yellow-400/50 text-yellow-300 ring-1 ring-yellow-400/30"
      }`}
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
        {isReconnecting ? (
          <>
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            <span className="hidden sm:inline">Reconnecting...</span>
            <span className="sm:hidden">Reconnecting</span>
          </>
        ) : isConnected ? (
          <>
            <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Disconnected</span>
            <span className="sm:hidden">Offline</span>
          </>
        )}
      </div>
    </div>
  )
}
