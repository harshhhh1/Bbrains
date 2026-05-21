"use client"

import React from 'react'
import { PageContainer } from "@/components/layout/page-primitives"

interface DashboardContentProps {
    children: React.ReactNode
    className?: string
    maxWidth?: string
    padding?: "none" | "sm" | "default" | "spacious"
    gap?: "none" | "sm" | "default" | "lg" | "xl"
}

export function DashboardContent({ 
    children, 
    className = "", 
    maxWidth = "max-w-7xl",
    padding = "default",
    gap = "none",
}: DashboardContentProps) {
    return (
        <PageContainer maxWidth={maxWidth} padding={padding} gap={gap} className={className}>
            {children}
        </PageContainer>
    )
}
