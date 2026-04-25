import { LoginForm } from '@/features/auth/components/login-form'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (token) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-paper-texture bg-[size:24px_24px] bg-hand-paper">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
