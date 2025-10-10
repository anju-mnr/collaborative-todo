"use client"

import { ConnectionStatus } from "@/app/components/ConnectionStatus"

export default function ResponsiveTestPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Responsive Design Test
          </h1>
          <p className="text-purple-200 text-sm sm:text-base">
            Test the app across different screen sizes
          </p>
        </div>

        {/* Screen Size Indicator */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-white text-sm">
            <span className="block sm:hidden text-green-300">📱 Mobile View (&lt; 640px)</span>
            <span className="hidden sm:block md:hidden text-blue-300">📟 Small Tablet (640-768px)</span>
            <span className="hidden md:block lg:hidden text-yellow-300">📱 Large Tablet (768-1024px)</span>
            <span className="hidden lg:block xl:hidden text-orange-300">💻 Desktop (1024-1280px)</span>
            <span className="hidden xl:block text-purple-300">🖥️ Large Desktop (&gt; 1280px)</span>
          </p>
        </div>

        {/* Connection Status Test */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Connection Status Component
          </h2>
          <div className="flex flex-wrap gap-4">
            <ConnectionStatus isConnected={true} />
            <ConnectionStatus isConnected={false} />
            <ConnectionStatus isConnected={true} isReconnecting={true} />
          </div>
        </div>

        {/* Mock Form Component */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Responsive Form Layout
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Add a new task..." 
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 min-h-[44px]"
            />
            <button className="px-4 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg min-h-[44px] sm:min-w-[120px]">
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Mock Task Cards */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Task Card Layout
          </h2>
          <div className="space-y-3">
            {["Test mobile layout", "Verify tablet responsiveness", "Check desktop experience"].map((task, i) => (
              <div key={i} className="bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-white/30" 
                  defaultChecked={i === 1}
                />
                <span className="text-white text-sm sm:text-base flex-1">{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Grid Test */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Grid Layout Test
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white text-center"
              >
                Card {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Touch Target Test */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Touch Target Test (44px minimum)
          </h2>
          <div className="space-y-3">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg min-h-[44px] w-full sm:w-auto">
              Mobile-Friendly Button
            </button>
            <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg text-sm">
              Desktop Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}