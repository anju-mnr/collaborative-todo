"use client"

import { useEffect, useState } from "react"
import { useSharedState } from "@airstate/react"
import Link from "next/link"

// Simple test component to verify AirState connection
export default function ConnectionTest() {
  const [testState, setTestState, isConnected] = useSharedState({ message: "Hello World" }, { key: "test-room" })
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`])
  }

  useEffect(() => {
    addLog(`Connection Status: ${isConnected ? "✅ Connected" : "❌ Disconnected"}`)
  }, [isConnected])

  useEffect(() => {
    addLog(`Environment: ${process.env.NODE_ENV}`)
    addLog(`AirState App ID: ${process.env.NEXT_PUBLIC_AIRSTATE_APP_ID ? "✅ Present" : "❌ Missing"}`)
    addLog(`Window object: ${typeof window !== "undefined" ? "✅ Available" : "❌ Not available"}`)
  }, [])

  const updateMessage = () => {
    const newMessage = `Updated at ${new Date().toLocaleTimeString()}`
    setTestState({ message: newMessage })
    addLog(`Message updated: ${newMessage}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 p-8">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8">
        <h1 className="text-3xl font-bold text-white mb-6">AirState Connection Test</h1>
        
        <div className="space-y-4 mb-6">
          <div className="bg-white/20 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-2">Connection Status</h2>
            <p className={`text-lg font-bold ${isConnected ? "text-green-300" : "text-red-300"}`}>
              {isConnected ? "✅ Connected to AirState" : "❌ Disconnected from AirState"}
            </p>
          </div>

          <div className="bg-white/20 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-2">Current Message</h2>
            <p className="text-white font-mono">{testState.message}</p>
            <button
              onClick={updateMessage}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-lg hover:shadow-lg transition-all"
              disabled={!isConnected}
            >
              Update Message {!isConnected && "(Disconnected)"}
            </button>
          </div>

          <div className="bg-white/20 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-2">Debug Log</h2>
            <div className="bg-black/30 rounded p-3 font-mono text-sm text-green-300 max-h-48 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-lg hover:shadow-lg transition-all"
          >
            ← Back to Todo App
          </Link>
        </div>
      </div>
    </div>
  )
}