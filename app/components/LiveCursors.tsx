"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useSharedState } from "@airstate/react"
import { useTodo } from "@/app/contexts/TodoContext"

interface CursorPosition {
  x: number
  y: number
  lastUpdate: number
  userId: string
  isClicking?: boolean // Add click state for interactive effects
  trail?: { x: number; y: number; timestamp: number }[] // Add trail for smooth animations
}

type CursorState = {
  cursors: Record<string, CursorPosition>
  [key: string]: any // Add index signature for Airstate compatibility
}

const Cursor = ({ 
  x, 
  y, 
  name, 
  color, 
  initials,
  isClicking = false
}: { 
  x: number
  y: number
  name: string
  color: string
  initials: string
  isClicking?: boolean
}) => {
  return (
    <div
      className="group pointer-events-auto absolute z-50 transition-all duration-200 ease-out cursor-none"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Outer glow ring - more intense when clicking */}
      <div 
        className={`absolute -inset-4 rounded-full animate-ping ${isClicking ? 'opacity-60 scale-125' : 'opacity-20'} transition-all duration-200`}
        style={{ backgroundColor: color }}
      />
      
      {/* Click ripple effect */}
      {isClicking && (
        <div 
          className="absolute -inset-8 rounded-full animate-ping opacity-40 border-4"
          style={{ borderColor: color }}
        />
      )}
      
      {/* Interactive cursor area */}
      <div className="relative">
        {/* Main cursor pointer */}
        <div className={`relative transform transition-transform duration-200 ${isClicking ? 'scale-125' : 'group-hover:scale-110'}`}>
          <svg
            width="28"
            height="40"
            viewBox="0 0 28 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl filter cursor-pointer"
          >
            {/* Outer glow */}
            <path
              d="M6.65376 14.3673H6.46026L6.31717 14.4976L1.500002 18.8829L1.500002 3.19841L13.7841 14.3673H6.65376Z"
              fill={color}
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              filter="url(#glow)"
            />
            {/* Main cursor */}
            <path
              d="M6.65376 14.3673H6.46026L6.31717 14.4976L1.500002 18.8829L1.500002 3.19841L13.7841 14.3673H6.65376Z"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
        </div>

        {/* Floating initials badge with pulse - more intense when clicking */}
        <div
          className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-2xl transform transition-all duration-300 ${
            isClicking ? 'scale-150 animate-bounce' : 'group-hover:scale-125 animate-pulse'
          }`}
          style={{ 
            backgroundColor: color,
            boxShadow: `0 0 ${isClicking ? '30px' : '20px'} ${color}60`
          }}
        >
          {initials}
        </div>

        {/* Enhanced ripple effect */}
        <div 
          className={`absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 animate-ping ${isClicking ? 'opacity-60' : 'opacity-30'}`}
          style={{ borderColor: color }}
        />

        {/* Name tooltip - shows on hover */}
        <div
          className="absolute ml-8 -mt-8 px-4 py-2 rounded-2xl text-sm font-bold text-white shadow-2xl border border-white/30 backdrop-blur-md transform transition-all duration-300 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 pointer-events-none z-50"
          style={{ 
            backgroundColor: `${color}F0`,
            boxShadow: `0 8px 32px ${color}40, 0 0 20px ${color}30`
          }}
        >
          <div className="relative">
            {name}
            {/* Tooltip arrow */}
            <div 
              className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent"
              style={{ borderRightColor: `${color}F0` }}
            />
          </div>
        </div>

        {/* Enhanced trail dots and particles */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Primary trail dots */}
          <div 
            className={`absolute w-2 h-2 rounded-full animate-pulse ${isClicking ? 'opacity-80' : 'opacity-60'}`}
            style={{ 
              backgroundColor: color,
              left: '-8px',
              top: '8px',
              animationDelay: '0.1s'
            }}
          />
          <div 
            className={`absolute w-1 h-1 rounded-full animate-pulse ${isClicking ? 'opacity-60' : 'opacity-40'}`}
            style={{ 
              backgroundColor: color,
              left: '-12px',
              top: '12px',
              animationDelay: '0.2s'
            }}
          />
          
          {/* Floating particles */}
          <div 
            className="absolute w-1 h-1 rounded-full cursor-particle opacity-50"
            style={{ 
              backgroundColor: color,
              left: '-15px',
              top: '-5px',
              animationDelay: '0.5s'
            }}
          />
          <div 
            className="absolute w-1 h-1 rounded-full cursor-particle opacity-30"
            style={{ 
              backgroundColor: color,
              left: '15px',
              top: '20px',
              animationDelay: '1s'
            }}
          />
          
          {/* Click burst effect */}
          {isClicking && (
            <>
              <div 
                className="absolute w-3 h-3 rounded-full animate-ping opacity-70"
                style={{ 
                  backgroundColor: color,
                  left: '-4px',
                  top: '4px'
                }}
              />
              {/* Sparkle particles on click */}
              <div 
                className="absolute w-2 h-2 rounded-full cursor-sparkle"
                style={{ 
                  backgroundColor: color,
                  left: '10px',
                  top: '-10px'
                }}
              />
              <div 
                className="absolute w-1 h-1 rounded-full cursor-sparkle"
                style={{ 
                  backgroundColor: color,
                  left: '-15px',
                  top: '25px',
                  animationDelay: '0.3s'
                }}
              />
              <div 
                className="absolute w-1 h-1 rounded-full cursor-sparkle"
                style={{ 
                  backgroundColor: color,
                  left: '20px',
                  top: '5px',
                  animationDelay: '0.6s'
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LiveCursors() {
  const { currentUser, roomKey, presenceUsers } = useTodo()
  const [lastUpdateTime, setLastUpdateTime] = useState(0)

  // Optional: also pass your public key here (fine if you already configure globally)
  const APP_ID =
    (process.env.NEXT_PUBLIC_AIRSTATE_APP_ID as string | undefined) ||
    (process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_KEY as string | undefined) ||
    (process.env.NEXT_PUBLIC_AIRSTATE_PUBLIC_TOKEN as string | undefined)

  // Use shared state for cursors with a unique key
  const [cursorState, setCursorState] = useSharedState<CursorState>(
    { cursors: {} },
    {
      key: `${roomKey}-cursors`,
      appId: APP_ID,
      publicKey: APP_ID,
      token: APP_ID,
    } as any
  )

  // Track mouse movement (throttled to improve performance)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now()
    // Throttle updates to every 50ms (20fps) to reduce network traffic
    if (now - lastUpdateTime < 50) return
    
    // Update cursor position in shared state
    if (currentUser) {
      setCursorState((prev) => ({
        ...prev,
        cursors: {
          ...prev.cursors,
          [currentUser.id]: {
            x: e.clientX,
            y: e.clientY,
            lastUpdate: now,
            userId: currentUser.id,
            isClicking: false
          }
        }
      }))
      setLastUpdateTime(now)
    }
  }, [currentUser, setCursorState, lastUpdateTime])

  // Track mouse clicks for interactive effects
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (currentUser) {
      setCursorState((prev) => ({
        ...prev,
        cursors: {
          ...prev.cursors,
          [currentUser.id]: {
            ...prev.cursors[currentUser.id],
            x: e.clientX,
            y: e.clientY,
            lastUpdate: Date.now(),
            userId: currentUser.id,
            isClicking: true
          }
        }
      }))
    }
  }, [currentUser, setCursorState])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (currentUser) {
      setCursorState((prev) => ({
        ...prev,
        cursors: {
          ...prev.cursors,
          [currentUser.id]: {
            ...prev.cursors[currentUser.id],
            x: e.clientX,
            y: e.clientY,
            lastUpdate: Date.now(),
            userId: currentUser.id,
            isClicking: false
          }
        }
      }))
    }
  }, [currentUser, setCursorState])

  // Mouse leave handler to hide cursor
  const handleMouseLeave = useCallback(() => {
    if (currentUser) {
      setCursorState((prev) => {
        const newCursors = { ...prev.cursors }
        delete newCursors[currentUser.id]
        return {
          ...prev,
          cursors: newCursors
        }
      })
    }
  }, [currentUser, setCursorState])

  // Add mouse event listeners
  useEffect(() => {
    if (!currentUser) return

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [currentUser, handleMouseMove, handleMouseLeave, handleMouseDown, handleMouseUp])

  // Cleanup stale cursors periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorState((prev) => {
        const now = Date.now()
        const activeCursors: Record<string, CursorPosition> = {}
        
        Object.entries(prev.cursors).forEach(([userId, cursor]) => {
          // Keep cursors that are less than 5 seconds old
          if (now - cursor.lastUpdate < 5000) {
            activeCursors[userId] = cursor
          }
        })
        
        return {
          ...prev,
          cursors: activeCursors
        }
      })
    }, 2000) // Clean up every 2 seconds

    return () => clearInterval(interval)
  }, [setCursorState])

  // Don't render if user is not joined
  if (!currentUser) {
    return null
  }

  // Filter out current user's cursor and get other users' cursors
  const otherCursors = Object.entries(cursorState.cursors).filter(([userId, cursor]) => {
    return userId !== currentUser.id
  })

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {otherCursors.map(([userId, cursor]) => {
        // Find the user info from presence users
        const user = presenceUsers.find(u => u.id === userId)
        if (!user) return null
        
        return (
          <Cursor
            key={userId}
            x={cursor.x}
            y={cursor.y}
            name={user.name}
            color={user.color}
            initials={user.initials || ""}
            isClicking={cursor.isClicking}
          />
        )
      })}
    </div>
  )
}