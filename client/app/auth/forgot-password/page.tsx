import { ForgotPasswordForm } from '@/features/auth/ui/forgot-password-form'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-hand-paper bg-paper-texture bg-[size:24px_24px]">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
