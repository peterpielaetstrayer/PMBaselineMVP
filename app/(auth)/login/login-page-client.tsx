"use client"

import { AuthForm } from "@/components/auth/auth-form"
import Link from "next/link"

interface LoginPageClientProps {
  emailConfirmed: boolean
}

export function LoginPageClient({ emailConfirmed }: LoginPageClientProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-ocean-light/20 to-ocean-deep/10 p-4">
      <AuthForm emailConfirmed={emailConfirmed} />
      <Link href="/guest" className="text-sm font-semibold text-ocean-deep underline underline-offset-4">Continue as guest — saved on this device</Link>
    </div>
  )
}
