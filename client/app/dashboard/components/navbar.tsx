"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { Bell, Menu, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, sessionData } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get college name from user data
  const collegeName = user?.college?.name || sessionData?.user?.college?.name || 'Loading Institution...'
  
  // Get user avatar or use default
  const avatarUrl = user?.userDetails?.avatar || user?.avatarUrl || null
  const userName = user?.userDetails?.firstName ? `${user.userDetails.firstName} ${user.userDetails.lastName || ''}` : user?.username || 'User'
  const userHandle = user?.username || 'user'

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.slice(0, 2).toUpperCase()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Brand Name - Left Side */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          {onMenuToggle && (
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-1"
            >
              <Menu size={20} />
            </button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9" />
                <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              B<span className="text-blue-600">brains</span>
            </span>
          </Link>
        </div>

        {/* College Name - Center */}
        <div className="hidden md:flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-gray-700 truncate max-w-md">
            {collegeName}
          </span>
        </div>

        {/* Profile Dropdown - Right Side */}
        <div className="flex items-center gap-3" ref={dropdownRef}>
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
          </button>

          {/* Profile Avatar with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden border-2 border-gray-200">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={userName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(userName)}</span>
                )}
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''} hidden sm:block`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">@{userHandle}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="border-t border-gray-100 pt-1">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
