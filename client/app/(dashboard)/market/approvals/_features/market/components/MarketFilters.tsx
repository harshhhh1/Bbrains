"use client"

import { Filter, Plus } from "lucide-react"

const categories = ["All Items", "Textbooks", "Electronics", "Furniture", "Clothing"]

export function MarketFilters() {
    return (
        <div className="space-y-6 mb-8">
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Filter className="h-4 w-4" />
                        Filters
                        <span className="bg-muted text-muted-foreground px-1.5 rounded-full text-xs ml-1">3</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                        <Plus className="h-4 w-4" />
                        Sell Item
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category, index) => (
                    <button
                        key={category}
                        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${index === 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    )
}
