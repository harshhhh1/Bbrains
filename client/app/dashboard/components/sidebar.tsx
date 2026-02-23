"use client"

import React, { useState } from 'react'
import { menuitems, MenuItem } from '../../config/menuItems'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import {
  LayoutDashboard, 
  Megaphone, 
  Wallet,
  GraduationCap, 
  MessageSquare, 
  CalendarCheck,
  Receipt, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react'

// Default role - in production this should come from user data
const currentUserRole = 'student'

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  announcement: <Megaphone size={20} />,
  wallet: <Wallet size={20} />,
  exams: <GraduationCap size={20} />,
  chat: <MessageSquare size={20} />,
  attendance: <CalendarCheck size={20} />,
  'payment-history': <Receipt size={20} />
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useAuth()

  // Get user role from auth context or use default
  const userType = user?.type || currentUserRole

  // Filter menu items based on user role
  const filteredItems = menuitems.filter(
    (item) => !item.roles?.length || item.roles.includes(userType)
  )

  // Get user display info
  const avatarUrl = user?.userDetails?.avatar || user?.avatarUrl || null
  const nickName = user?.userDetails?.firstName 
    ? `${user.userDetails.firstName} ${user.userDetails.lastName || ''}` 
    : user?.username || 'User'
  const userName = user?.username || 'username'

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <aside 
      className={`min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >

      {/* Navigation Menu - Takes remaining space */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`)
            
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <div className={`${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                } flex-shrink-0 transition-colors`}>
                  {iconMap[item.label] || <LayoutDashboard size={20} />}
                </div>
                
                {!isCollapsed && (
                  <span className="truncate text-sm">{item.name}</span>
                )}
                
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Profile Card Pinned at Bottom */}
      <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden border-2 border-white shadow-sm">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={nickName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(nickName)}</span>
                )}
              </div>
              {/* Online Status Indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500" />
            </div>

            {/* User Info - Hidden when collapsed */}
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {nickName}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  @{userName}
                </span>
              </div>
            )}
          </div>

          {/* Settings Cogwheel - Hidden when collapsed */}
          {!isCollapsed && (
            <Link 
              href="/settings" 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Settings"
            >
              <Settings size={18} />
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
