import { redirect } from "next/navigation"
import { resolveAuthenticatedLoginRedirect } from "@/lib/auth/routing"
import { createClient } from "@/lib/supabase/server"
import { LoginPageClient } from "./login-page-client"

interface LoginPageProps {
  searchParams: Promise<{ confirmed?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const redirectTo = resolveAuthenticatedLoginRedirect(!!user)
  if (redirectTo) {
    redirect(redirectTo)
  }

  return <LoginPageClient emailConfirmed={params.confirmed === "1"} />
}
