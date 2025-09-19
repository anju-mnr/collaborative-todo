"use client"
import { Users, LogOut, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu"
import type { User as UserType } from "@/app/types"

interface PresenceBarProps {
  users: UserType[]
  currentUser: UserType | null
  onLogout: () => void
}

export function PresenceBar({ users, currentUser, onLogout }: PresenceBarProps) {
  const otherUsers = users.filter((user) => user.id !== currentUser?.id)
  const totalUsers = users.length

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{totalUsers} online</span>
            <span className="xs:hidden">{totalUsers}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold">Active Members ({totalUsers})</div>
          <DropdownMenuSeparator />
          {currentUser && (
            <DropdownMenuItem className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.initials}
              </div>
              <span>{currentUser.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">(You)</span>
            </DropdownMenuItem>
          )}
          {otherUsers.map((user) => (
            <DropdownMenuItem key={user.id} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: user.color }}
              >
                {user.initials}
              </div>
              <span>{user.name}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Avatars */}

      {currentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 hover:bg-muted p-1 rounded-md transition-colors">
              {/* <User className="w-4 h-4 text-muted-foreground" /> */}
              <div
                className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-medium shadow-sm"
                style={{ backgroundColor: currentUser.color }}
                title={`${currentUser.name} (You)`}
              >
                {currentUser.initials}
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
              {/* <ChevronDown className="w-3 h-3 text-muted-foreground" /> */}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: currentUser.color }}
                >
                  {currentUser.initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{currentUser.name}</div>
                  <div className="text-xs text-muted-foreground">Online</div>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Connection Status */}
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-muted-foreground hidden sm:inline">Live</span>
      </div>
    </div>
  )
}
