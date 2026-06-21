"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  email: string
}

export function AppHeader({ email }: AppHeaderProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <header className="border-b border-ocean-light/40 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ocean-deep">PMBaseline</p>
          <p className="text-xs text-navy-text/60">Choose the right next move</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[10rem] truncate text-xs text-navy-text/70 sm:inline">
            {email}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
