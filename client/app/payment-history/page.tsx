"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getMyOrders, getMyTransactions } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Receipt, ShoppingBag, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { cn } from '@/lib/utils'

dayjs.extend(relativeTime)

interface Order {
    id: number
    status: string
    total?: number
    createdAt: string
    items?: { product?: { name: string }; quantity: number; price: number }[]
}

interface Transaction {
    id: number
    type: string
    amount: number
    note?: string
    createdAt: string
}

function orderStatusColor(status: string) {
    switch (status?.toUpperCase()) {
        case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200'
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200'
        default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

export default function PaymentHistoryPage() {
    const { isLoading: authLoading } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return
        Promise.all([
            getMyOrders().catch(() => []),
            getMyTransactions().catch(() => []),
        ])
            .then(([o, t]) => {
                setOrders(Array.isArray(o) ? o : [])
                setTransactions(Array.isArray(t) ? t : [])
            })
            .finally(() => setLoading(false))
    }, [authLoading])

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Receipt size={20} className="text-orange-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-sm text-gray-500">Your orders and wallet transactions</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            ) : (
                <Tabs defaultValue="orders">
                    <TabsList>
                        <TabsTrigger value="orders" className="gap-2">
                            <ShoppingBag size={14} />
                            Orders ({orders.length})
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="gap-2">
                            <Receipt size={14} />
                            Transactions ({transactions.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders" className="mt-4 space-y-3">
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                                <ShoppingBag size={40} strokeWidth={1.5} />
                                <p className="text-sm">No orders yet</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <Card key={order.id} className="gap-0 py-0 overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                                <ShoppingBag size={18} className="text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-semibold text-gray-900">Order #{order.id}</span>
                                                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', orderStatusColor(order.status))}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                {order.items && order.items.length > 0 && (
                                                    <ul className="space-y-0.5">
                                                        {order.items.map((item, i) => (
                                                            <li key={i} className="text-xs text-gray-500">
                                                                {item.product?.name || 'Item'} × {item.quantity} — ₿{item.price.toFixed(2)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    <span>{dayjs(order.createdAt).fromNow()}</span>
                                                    {order.total !== undefined && (
                                                        <span className="font-semibold text-gray-700">Total: ₿{order.total.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="transactions" className="mt-4 space-y-3">
                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                                <Receipt size={40} strokeWidth={1.5} />
                                <p className="text-sm">No transactions yet</p>
                            </div>
                        ) : (
                            transactions.map((tx) => {
                                const isSent = tx.type === 'DEBIT' || tx.type === 'TRANSFER_OUT'
                                return (
                                    <Card key={tx.id} className="gap-0 py-0 overflow-hidden">
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                                                    isSent ? 'bg-red-50' : 'bg-green-50'
                                                )}>
                                                    {isSent
                                                        ? <ArrowUpRight size={18} className="text-red-500" />
                                                        : <ArrowDownLeft size={18} className="text-green-500" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {tx.note || tx.type}
                                                        </p>
                                                        <span className={cn(
                                                            'text-sm font-bold flex-shrink-0',
                                                            isSent ? 'text-red-600' : 'text-green-600'
                                                        )}>
                                                            {isSent ? '-' : '+'}₿{tx.amount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{tx.type}</span>
                                                        <span>{dayjs(tx.createdAt).fromNow()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
