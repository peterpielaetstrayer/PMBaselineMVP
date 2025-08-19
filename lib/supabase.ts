import { createClient } from '@supabase/supabase-js'

// Only create client on client side
let supabase: any = null

if (typeof window !== 'undefined') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase config:', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'none'
  })
  
  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey)
      console.log('Supabase client created successfully')
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
    }
  } else {
    console.log('Supabase environment variables not configured, using localStorage only')
  }
}

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
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

// Helper function to get user session
export const getSession = async () => {
  if (!supabase) return null
  
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}
