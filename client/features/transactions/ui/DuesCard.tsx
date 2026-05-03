"use client"

import { Wallet, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import type { DuesData, User } from "@/services/api/client"
import { formatCurrency } from "@/features/transactions/model/utils"

interface DuesCardProps {
  duesData: DuesData
  currentUser: User | null
  payAmount: string
  setPayAmount: (v: string) => void
  isPaying: boolean
  payDialogOpen: boolean
  setPayDialogOpen: (v: boolean) => void
  onPay: () => void
}

export function DuesCard({
  duesData, currentUser, payAmount, setPayAmount,
  isPaying, payDialogOpen, setPayDialogOpen, onPay,
}: DuesCardProps) {
  return (
    <Card className="border-none bg-gradient-to-br from-brand-purple/90 to-brand-purple shadow-xl text-white overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Wallet className="size-32 rotate-12" />
      </div>
      <CardContent className="p-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Course Dues Summary</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black">{formatCurrency(duesData.dues)}</h2>
              <span className="text-sm font-medium text-white/80">
                remaining out of {formatCurrency(duesData.totalCourseFee)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {duesData.courses.map((c) => (
                <Badge key={c.id} className="bg-white/20 hover:bg-white/30 border-none text-white text-[10px] font-bold">
                  {c.name}
                </Badge>
              ))}
            </div>
          </div>

          <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-brand-purple hover:bg-white/90 font-black uppercase tracking-widest px-8 h-12 rounded-2xl shadow-lg border-none">
                Pay Dues <ArrowRight className="ml-2 size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Record Fee Payment</DialogTitle>
                <DialogDescription className="font-medium text-muted-foreground">
                  Enter the amount you wish to pay towards your course fees.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest">
                    Amount to Pay (INR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-8 h-14 rounded-2xl border-2 focus:border-brand-purple focus:ring-0 text-lg font-bold"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 px-1">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    Maximum payable: {formatCurrency(duesData.dues)}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={onPay}
                  disabled={isPaying || !payAmount}
                  className="w-full h-14 rounded-2xl bg-brand-purple hover:bg-brand-purple/90 text-white font-black uppercase tracking-widest text-base shadow-xl"
                >
                  {isPaying ? <Loader2 className="animate-spin mr-2" /> : null}
                  Pay with Razorpay
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
