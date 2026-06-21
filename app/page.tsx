import { redirect } from "next/navigation"
import { resolveRootRedirect } from "@/lib/auth/routing"
import { createClient } from "@/lib/supabase/server"

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(resolveRootRedirect(!!user))
}
