/**
 * @deprecated Legacy Supabase client and table constants.
 * Use `@/lib/supabase/client` and `@/lib/supabase/database.types` for new code.
 * Do not add new writes to legacy tables (users, checkins, milestones, user_minimums).
 */
import { getBrowserClient } from '@/lib/supabase/client'

// Reuse the canonical browser singleton — do not create a second GoTrueClient here.
// Typed as any so legacy hybrid-storage can still target old table names.
const supabase: any = typeof window !== 'undefined' ? getBrowserClient() : null

export { supabase }

// Database table names
export const TABLES = {
  USERS: 'users',
  CHECKINS: 'checkins',
  MILESTONES: 'milestones',
  USER_MINIMUMS: 'user_minimums',
} as const

// Helper function to get current user
export const getCurrentUser = async () => {
  if (!supabase) return null

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

// Helper function to get user session
export const getSession = async () => {
  if (!supabase) return null

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}
