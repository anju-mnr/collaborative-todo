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
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full shadow-lg border transition-all ${
        isConnected && !isReconnecting
          ? "bg-green-500/20 backdrop-blur-sm border-green-400/30 text-green-100"
          : "bg-yellow-500/20 backdrop-blur-sm border-yellow-400/30 text-yellow-100"
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
