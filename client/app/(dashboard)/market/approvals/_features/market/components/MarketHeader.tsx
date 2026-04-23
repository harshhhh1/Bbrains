"use client"

import { ChevronRight, Bell, Search, ShoppingCart } from "lucide-react"

export function MarketHeader() {
    return (
        <header className="h-20 flex items-center justify-between px-8 border-b border-border shrink-0">
            <div className="flex items-center text-sm text-muted-foreground">
                <span className="hover:text-foreground cursor-pointer transition-colors">Bbrains</span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="font-medium text-foreground">Campus Market</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        className="w-64 pl-10 pr-4 py-2 bg-secondary border-none rounded-full text-sm focus:ring-2 focus:ring-ring outline-none text-foreground placeholder:text-muted-foreground"
                        placeholder="Search products..."
                        type="text"
                    />
                </div>

                <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors relative">
                    <Bell className="h-5 w-5" />
                </button>

                <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors relative">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background"></span>
                </button>
            </div>
        </header>
    )
}
