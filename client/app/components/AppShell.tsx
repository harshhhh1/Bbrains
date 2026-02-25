"use client"

import { useState } from "react"
import Navbar from "@/app/dashboard/components/navbar"
import Sidebar from "@/app/dashboard/components/sidebar"

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Navbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            <div className="flex flex-1 overflow-hidden">
                <div className={`
                    fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <Sidebar />
                </div>
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
                <main className="flex-1 min-w-0 flex flex-col bg-white overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
