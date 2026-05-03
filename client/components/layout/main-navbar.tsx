"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "@/context/theme"
import { Button } from "@/components/ui/button"
import {

    CalendarDays,
    LogOut,
    User,
    Coins,
    ChevronLeft,
} from "lucide-react"
import { getBaseUrl, setAuthToken, marketApi, authApi, type Product } from "@/services/api/client"
import { NotificationsBell } from "@/components/shell/NotificationsBell"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavbarUser = {
    id?: string
    imageUrl?: string
    firstName?: string
    lastName?: string
    fullName?: string
    username?: string
    type?: string
    appRole?: string
    roles?: string[]
    collegeName?: string
    coins?: number
    isImpersonating?: boolean
}

function toTitleCase(value: string) {
    return value
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildPathLabels(pathname: string) {
    const segments = pathname
        .split("/")
        .filter(Boolean)
        .filter((segment) => segment !== "(dashboard)")

    if (segments.length === 0) {
        return ["Dashboard"]
    }

    const labels = segments.map((segment) => toTitleCase(segment))
    return labels[0] === "Dashboard" ? labels : ["Dashboard", ...labels]
}

function getPrimaryTitle(pathname: string) {
    const labels = buildPathLabels(pathname)
    return labels[labels.length - 1] || "Dashboard"
}

function getRoleLabel(type?: string) {
    if (!type) return "Workspace"
    return `${toTitleCase(type)} Panel`
}

export function MainNavbar({ user }: { user?: NavbarUser | null }) {
    const router = useRouter()
    const pathname = usePathname()
    const { currentTheme, themes } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [todayLabel, setTodayLabel] = React.useState("")
    const [dynamicProduct, setDynamicProduct] = React.useState<Product | null>(null)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Fetch product details if on market product page
    React.useEffect(() => {
        const segments = pathname.split("/").filter(Boolean)
        const isMarketProduct = segments[0] === "market" && segments[1] && segments.length === 2
        
        if (isMarketProduct) {
            const productId = parseInt(segments[1])
            if (!isNaN(productId)) {
                marketApi.getProduct(productId).then(resp => {
                    if (resp.success && resp.data) {
                        setDynamicProduct(resp.data)
                    }
                }).catch(console.error)
            }
        } else {
            setDynamicProduct(null)
        }
    }, [pathname])

    const isDark = themes.find(t => t.id === currentTheme)?.isDark || false
    const logoSrc = isDark ? "/logo-white.png" : "/logo-dark.png"

    const breadcrumbLabels = useMemo(() => buildPathLabels(pathname), [pathname])
    const pageTitle = useMemo(() => getPrimaryTitle(pathname), [pathname])

    React.useEffect(() => {
        setTodayLabel(
            new Intl.DateTimeFormat("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
            }).format(new Date())
        )
    }, [])

    const handleLogout = async () => {
        try {
            await authApi.logout()
        } catch (e) {
            console.error('Logout error:', e)
        }
        setAuthToken(null)
        router.push("/auth/login")
        router.refresh()
    }

    const handleStopImpersonating = () => {
        document.cookie = "impersonateCollegeId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/colleges");
        router.refresh();
    };

    return (
        <nav className="sticky top-0 z-(--z-nav) border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/65">
            <div className="mx-auto flex h-19 items-center gap-3 px-4 md:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">

                    <SidebarTrigger aria-label="Toggle Sidebar" className="hidden md:flex h-11 w-11 rounded-2xl border border-border/70 bg-card/80 text-foreground shadow-sm transition hover:bg-card" />

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="min-w-0">
                            <div className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:flex">
                                <span>
                                    {(user?.appRole === "superadmin" || user?.appRole === "admin" || user?.type === "admin") && !user?.isImpersonating
                                        ? "Admin Panel"
                                        : (user?.collegeName || "Bbrains Academy")}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                                <span>{todayLabel}</span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2">
                                <h1 className="truncate text-lg font-bold tracking-tight text-foreground md:text-xl">
                                    {dynamicProduct 
                                        ? `${dynamicProduct.name} by ${dynamicProduct.creator?.userDetails?.firstName || dynamicProduct.creator?.username || "Scholar"}`
                                        : pageTitle}
                                </h1>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden items-center justify-end flex-1 xl:flex mr-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/50 px-4 py-2 shadow-sm ring-1 ring-border/5">
                        <div className="flex h-9 w-9 items-center justify-center">
                            <Image src="/bcoin.svg" width={36} height={36} alt="BCoin" className="drop-shadow-sm" />
                        </div>
                        <div className="flex flex-col ml-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Balance</span>
                            <span className="text-sm font-bold text-foreground tabular-nums leading-none mt-0.5">
                                {Number(user?.coins || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 md:gap-3">
                    {user?.isImpersonating && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStopImpersonating}
                            className="hidden h-9 items-center gap-2 border-emerald-500/30 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 lg:flex"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Colleges
                        </Button>
                    )}
                    <div className="hidden items-center gap-2 rounded-2xl border border-border/70 bg-card/70 p-1 shadow-sm sm:flex">
                        <div className="rounded-xl bg-background/80">
                            <ThemeSwitcher />
                        </div>
                        <div className="rounded-xl bg-background/80">
                            <NotificationsBell />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:hidden">
                        <ThemeSwitcher />
                        <NotificationsBell />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button suppressHydrationWarning aria-label="User Menu" className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-2.5 py-2 shadow-sm transition hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring">
                                <div className="hidden text-right md:block">
                                    <p className="max-w-35 truncate text-sm font-semibold text-foreground">
                                        {user?.fullName || user?.username || "Anonymous User"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {getRoleLabel(user?.type)}
                                    </p>
                                </div>

                                <Avatar
                                    key={user?.imageUrl}
                                    className="h-9 w-9 rounded-2xl border border-border/70 shadow-sm md:h-10 md:w-10"
                                >
                                    <AvatarImage src={user?.imageUrl || undefined} alt={user?.fullName || user?.username || "User Avatar"} />
                                    <AvatarFallback name={user?.username} />
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="mt-2 w-64 rounded-2xl border-border/70 p-2">
                            <DropdownMenuLabel className="px-3 py-2">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        key={user?.imageUrl}
                                        className="h-10 w-10 rounded-2xl border border-border/70"
                                    >
                                        <AvatarImage src={user?.imageUrl || undefined} alt={user?.fullName || user?.username || "User Avatar"} />
                                        <AvatarFallback name={user?.username} />
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {user?.fullName || user?.username || "Anonymous User"}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {getRoleLabel(user?.type)}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5">
                                <Link href="/settings" className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Account Settings</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/40"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}
