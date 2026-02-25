"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getWallet, getWalletHistory, setupWalletPin, changeWalletPin } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import TransferForm from '@/app/dashboard/components/TransferForm'
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Settings, RefreshCw } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { cn } from '@/lib/utils'

dayjs.extend(relativeTime)

interface WalletData {
    id: number
    balance: number
    userId: string
}

interface TransactionRecord {
    id: number
    type: string
    amount: number
    note?: string
    createdAt: string
}

export default function WalletPage() {
    const { isLoading: authLoading } = useAuth()
    const [wallet, setWallet] = useState<WalletData | null>(null)
    const [history, setHistory] = useState<TransactionRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [pinMode, setPinMode] = useState<'setup' | 'change' | null>(null)
    const [oldPin, setOldPin] = useState('')
    const [newPin, setNewPin] = useState('')
    const [pinError, setPinError] = useState<string | null>(null)
    const [pinSuccess, setPinSuccess] = useState(false)
    const [pinSubmitting, setPinSubmitting] = useState(false)

    const load = useCallback(async () => {
        try {
            const [w, h] = await Promise.all([
                getWallet(),
                getWalletHistory().catch(() => []),
            ])
            setWallet(w)
            setHistory(Array.isArray(h) ? h : [])
        } catch {
            setWallet(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!authLoading) load()
    }, [authLoading, load])

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setPinError(null)
        setPinSuccess(false)

        if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
            setPinError('PIN must be exactly 6 digits')
            return
        }

        try {
            setPinSubmitting(true)
            if (pinMode === 'setup') {
                await setupWalletPin(newPin)
            } else {
                if (oldPin.length !== 6) {
                    setPinError('Old PIN must be 6 digits')
                    return
                }
                await changeWalletPin(oldPin, newPin)
            }
            setPinSuccess(true)
            setOldPin('')
            setNewPin('')
            setPinMode(null)
        } catch (err: any) {
            setPinError(err.message || 'Failed to update PIN')
        } finally {
            setPinSubmitting(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <Skeleton className="h-32 rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                        <Wallet size={20} className="text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">My Wallet</h1>
                        <p className="text-sm text-gray-500">Manage your balance and transfers</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={load} className="gap-2">
                    <RefreshCw size={14} />
                    Refresh
                </Button>
            </div>

            {wallet ? (
                <>
                    <Card className="bg-gradient-to-r from-green-600 to-emerald-500 text-white border-0 gap-0 py-6">
                        <CardContent className="px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium mb-1">Current Balance</p>
                                    <p className="text-4xl font-bold">₿{wallet.balance.toFixed(2)}</p>
                                    <p className="text-green-200 text-xs mt-2">Wallet ID: {wallet.id}</p>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                    <Wallet size={28} className="text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="transfer">
                        <TabsList className="w-full">
                            <TabsTrigger value="transfer" className="flex-1">Transfer</TabsTrigger>
                            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="transfer" className="mt-4">
                            <TransferForm onSuccess={load} />
                        </TabsContent>

                        <TabsContent value="history" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <History size={16} className="text-gray-500" />
                                        <CardTitle className="text-sm font-semibold text-gray-800">Transaction History</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 pb-5">
                                    {history.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">No transactions yet</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {history.map((tx) => {
                                                const isSent = tx.type === 'DEBIT' || tx.type === 'TRANSFER_OUT'
                                                return (
                                                    <li key={tx.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                                        <div className={cn(
                                                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                                            isSent ? 'bg-red-50' : 'bg-green-50'
                                                        )}>
                                                            {isSent
                                                                ? <ArrowUpRight size={16} className="text-red-500" />
                                                                : <ArrowDownLeft size={16} className="text-green-500" />
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                                {tx.note || tx.type}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{dayjs(tx.createdAt).fromNow()}</p>
                                                        </div>
                                                        <span className={cn(
                                                            'text-sm font-semibold flex-shrink-0',
                                                            isSent ? 'text-red-600' : 'text-green-600'
                                                        )}>
                                                            {isSent ? '-' : '+'}₿{tx.amount.toFixed(2)}
                                                        </span>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Settings size={16} className="text-gray-500" />
                                        <CardTitle className="text-sm font-semibold text-gray-800">PIN Settings</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 space-y-3">
                                    {!pinMode ? (
                                        <div className="flex gap-3">
                                            <Button variant="outline" size="sm" onClick={() => { setPinMode('setup'); setPinError(null); setPinSuccess(false) }}>
                                                Setup PIN
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => { setPinMode('change'); setPinError(null); setPinSuccess(false) }}>
                                                Change PIN
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handlePinSubmit} className="space-y-3 max-w-xs">
                                            {pinMode === 'change' && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Current PIN</label>
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••"
                                                        value={oldPin}
                                                        onChange={(e) => setOldPin(e.target.value)}
                                                        maxLength={6}
                                                        inputMode="numeric"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">New PIN (6 digits)</label>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••"
                                                    value={newPin}
                                                    onChange={(e) => setNewPin(e.target.value)}
                                                    maxLength={6}
                                                    inputMode="numeric"
                                                />
                                            </div>
                                            {pinError && (
                                                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pinError}</p>
                                            )}
                                            {pinSuccess && (
                                                <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">PIN updated successfully!</p>
                                            )}
                                            <div className="flex gap-2">
                                                <Button type="submit" size="sm" disabled={pinSubmitting}>
                                                    {pinSubmitting ? 'Saving...' : 'Save PIN'}
                                                </Button>
                                                <Button type="button" variant="outline" size="sm" onClick={() => { setPinMode(null); setOldPin(''); setNewPin(''); setPinError(null) }}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                        <Wallet size={48} strokeWidth={1.5} className="text-gray-300" />
                        <p className="text-sm text-gray-500">Wallet not found. Please contact support.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
