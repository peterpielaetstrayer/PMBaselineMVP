"use client"

import { AuthForm } from "@/components/auth/auth-form"

interface LoginPageClientProps {
  emailConfirmed: boolean
}

export function LoginPageClient({ emailConfirmed }: LoginPageClientProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-light/20 to-ocean-deep/10 p-4">
      <AuthForm emailConfirmed={emailConfirmed} />
    </div>
  )
}
