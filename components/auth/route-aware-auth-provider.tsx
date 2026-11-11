"use client"

import { usePathname } from "next/navigation"
import { AuthProvider } from "@/contexts/auth-context"

/**
 * The local guest workspace must never initialize Supabase auth. All other
 * application routes keep their existing authenticated context.
 */
export function RouteAwareAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === "/guest" || pathname.startsWith("/guest/")) {
    return <>{children}</>
  }
  return <AuthProvider>{children}</AuthProvider>
}
