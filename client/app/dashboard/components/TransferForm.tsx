"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { transferFunds } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Send } from 'lucide-react'

interface TransferFormProps {
    onSuccess?: () => void
}

export default function TransferForm({ onSuccess }: TransferFormProps) {
    const [recipientWalletId, setRecipientWalletId] = useState('')
    const [amount, setAmount] = useState('')
    const [pin, setPin] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        const walletId = parseInt(recipientWalletId)
        const amt = parseFloat(amount)

        if (isNaN(walletId) || walletId <= 0) {
            setError('Please enter a valid wallet ID')
            return
        }
        if (isNaN(amt) || amt <= 0) {
            setError('Please enter a valid amount')
            return
        }
        if (pin.length !== 6) {
            setError('PIN must be 6 digits')
            return
        }

        try {
            setLoading(true)
            await transferFunds({ recipientWalletId: walletId, amount: amt, pin, note: note || undefined })
            setSuccess(true)
            setRecipientWalletId('')
            setAmount('')
            setPin('')
            setNote('')
            onSuccess?.()
        } catch (err: any) {
            setError(err.message || 'Transfer failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Send size={16} className="text-blue-600" />
                    <CardTitle className="text-sm font-semibold text-gray-800">Transfer Funds</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Recipient Wallet ID</label>
                        <Input
                            type="number"
                            placeholder="e.g. 42"
                            value={recipientWalletId}
                            onChange={(e) => setRecipientWalletId(e.target.value)}
                            min={1}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                        <Input
                            type="number"
                            placeholder="e.g. 50"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={0.01}
                            step={0.01}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Note (optional)</label>
                        <Input
                            type="text"
                            placeholder="What's this for?"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={255}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">PIN (6 digits)</label>
                        <Input
                            type="password"
                            placeholder="••••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={6}
                            inputMode="numeric"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}
                    {success && (
                        <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">Transfer successful!</p>
                    )}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Transferring...' : 'Send Transfer'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
