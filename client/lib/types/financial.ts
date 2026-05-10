export interface WalletData {
    id: string
    balance: number | string
    pinSet?: boolean
    user?: {
        username: string
        avatarUrl?: string
    }
}

export interface MoneyRequest {
    id: string
    fromUserId: string
    toUserId: string
    amount: number
    reason: string
    status: string
    createdAt: string
    fromUser?: {
        username: string
        displayName?: string
        avatarUrl?: string
    }
}

export interface ApiTransaction {
    id: number
    userId: string
    recordedById?: string | null
    relatedUserId?: string | null
    entryGroupId?: string | null
    transactionDate: string
    amount: number | string
    type: "credit" | "debit"
    category?: "salary" | "fee" | "transfer" | "other" | string
    status: "success" | "failed" | "pending"
    paymentMode?: string | null
    referenceId?: string | null
    primaryRecord?: boolean
    note?: string
    description?: string
    user?: any
    relatedUser?: any
    recordedByUser?: any
}