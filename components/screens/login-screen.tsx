"use client"

/**
 * Legacy-only login wrapper used by `/legacy`.
 * "Continue without account" is a legacy guest path — not shown on `/login`.
 */
import { AuthForm } from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"

interface LoginScreenProps {
  onSuccess: () => void
  onBack: () => void
}

export function LoginScreen({ onSuccess, onBack }: LoginScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <AuthForm
          onAuthenticated={onSuccess}
          title="Welcome to PM Baseline"
          subtitle="Sign in to sync your progress across devices"
        />

        <div className="text-center">
          <Button variant="ghost" onClick={onBack} className="text-navy-text/60">
            ← Continue without account
          </Button>
        </div>
      </div>
    </div>
  )
}
