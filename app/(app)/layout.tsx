import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app/app-header"
import { resolveUnauthenticatedAppRedirect } from "@/lib/auth/routing"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const redirectTo = resolveUnauthenticatedAppRedirect(!!user)
  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-light/15 to-ocean-deep/5">
      <AppHeader email={user!.email ?? "Account"} />
      <main>{children}</main>
    </div>
  )
}
