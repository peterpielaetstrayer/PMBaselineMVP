import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

export type SupabaseBrowserClient = ReturnType<typeof createClient>

let browserClient: SupabaseBrowserClient | null | undefined

/** Singleton browser client; null when Supabase env vars are missing. */
export function getBrowserClient(): SupabaseBrowserClient | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (browserClient === undefined) {
    browserClient = isSupabaseConfigured() ? createClient() : null
  }

  return browserClient
}
