'use client'

import { LoginForm } from '@/features/auth/ui/login-form'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      router.push('/dashboard')
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return null
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-paper-texture bg-[size:24px_24px] bg-hand-paper">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}