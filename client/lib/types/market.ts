export interface ApiProduct {
    id: number
    name: string
    description?: string
    price: number | string
    stock: number
    image?: string
    images?: string[]
    approval: "pending" | "approved" | "rejected" | "draft"
    createdAt: string
    creator?: {
        username: string;
        type: string;
        userDetails?: {
            firstName: string;
            lastName: string;
            displayName?: string;
            avatar?: string;
        }
    }
    rating?: number
    reviewCount?: number
    unitsSold?: number
    totalRevenue?: number | string
    productType?: "digital" | "physical"
    metadata?: {
        productType?: "digital" | "physical"
        rejectionReason?: string
        fileType?: string
        fileUrl?: string
        images?: string[]
        previewImages?: string[]
        [key: string]: unknown
    }
}

export interface Review {
    id: number
    userId: string
    productId: number
    rating: number
    comment: string
    createdAt: string
    user?: {
        username: string
        userDetails?: {
            firstName: string
            lastName?: string
            displayName?: string
            avatar?: string
        }
    }
}

export interface ReviewStats {
    averageRating: number
    totalReviews: number
    ratingCounts: Record<number, number>
}

export interface SalesData {
    totalEarnings: number
    digitalSales: { units: number; revenue: number }
    physicalSales: { units: number; revenue: number }
    productBreakdown: {
        productId: number
        name: string
        productType: string
        unitsSold: number
        revenue: number
        avgRating: number
    }[]
    recentTransactions: {
        product: string
        buyer: string
        amount: number
        date: string
    }[]
}

export interface LibraryItem {
    id: string | number
    productId: number
    name: string
    image?: string | null
    creator?: string
    purchasedAt: string
    category: string
    fileUrl?: string | null
}

export interface CartItem {
    id: number
    userId: string
    productId: number
    quantity: number
    createdAt: string
    product?: ApiProduct
}

export interface ApiOrderItem {
    id: number
    productId: number
    quantity: number
    price: number | string
    product?: ApiProduct
}

export interface ApiOrder {
    id: number | string
    userId: string
    totalAmount: number | string
    status: string
    orderDate: string
    orderType?: string
    qrCode?: string | null
    items: ApiOrderItem[]
}