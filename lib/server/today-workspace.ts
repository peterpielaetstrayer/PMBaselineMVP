import { getBaselineProfile, type BaselineProfile } from '@/lib/data/baseline-profiles'
import { getProfile, type Profile } from '@/lib/data/profiles'
import { getLatestReflectionForUser } from '@/lib/data/reflections'
import type { AuthenticatedSupabaseClient } from '@/lib/data/session'
import { createClient } from '@/lib/supabase/server'

export interface TodayWorkspace {
  email: string
  displayName: string | null
  profile: Profile | null
  baselineProfile: BaselineProfile | null
  profileMissing: boolean
  baselineProfileMissing: boolean
  hasSavedReflection: boolean
}

export function resolveTodayGreeting(
  displayName: string | null | undefined,
  email: string
): string {
  const trimmed = displayName?.trim()
  if (trimmed) {
    return trimmed
  }
  return email
}

export async function loadTodayWorkspace(
  client: AuthenticatedSupabaseClient,
  user: { email?: string | null }
): Promise<TodayWorkspace> {
  const email = user.email?.trim() || 'your account'

  const [profileResult, baselineResult, latestReflectionResult] = await Promise.all([
    getProfile(client),
    getBaselineProfile(client),
    getLatestReflectionForUser(client),
  ])

  return {
    email,
    displayName: profileResult.ok ? profileResult.data.display_name : null,
    profile: profileResult.ok ? profileResult.data : null,
    baselineProfile: baselineResult.ok ? baselineResult.data : null,
    profileMissing: !profileResult.ok && profileResult.error.code === 'NOT_FOUND',
    baselineProfileMissing:
      !baselineResult.ok && baselineResult.error.code === 'NOT_FOUND',
    hasSavedReflection: latestReflectionResult.ok,
  }
}

export async function getTodayWorkspace(): Promise<TodayWorkspace | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return loadTodayWorkspace(supabase, user)
}
