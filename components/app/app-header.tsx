"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  email: string
}

const NAV_ITEMS = [
  { href: BASELINE_ROUTES.today, label: "Today" },
  { href: BASELINE_ROUTES.history, label: "History" },
] as const

export function AppHeader({ email }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)
    try {
      await signOut()
      router.replace(BASELINE_ROUTES.login)
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="border-b border-ocean-light/40 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ocean-deep">PMBaseline</p>
          <p className="text-xs text-navy-text/60">Choose the right next move</p>
        </div>

        <nav
          aria-label="Main"
          className="order-3 flex w-full gap-1 sm:order-none sm:w-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-deep/40 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-ocean-light/40 text-ocean-deep"
                    : "text-navy-text/70 hover:bg-ocean-light/20 hover:text-navy-text"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex min-w-0 items-center gap-3">
          <span
            className="hidden max-w-[10rem] truncate text-xs text-navy-text/70 sm:inline"
            title={email}
          >
            {email}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </header>
  )
}
