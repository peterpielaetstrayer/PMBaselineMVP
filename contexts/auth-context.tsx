"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { hybridStorage } from '@/lib/hybrid-storage'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Ensure user profile exists in database
  const ensureUserProfile = async (user: User) => {
    if (!supabase) return
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'User',
            timezone: 'UTC',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        
        if (createError) {
          console.error('Failed to create user profile:', createError)
        } else {
          console.log('User profile created successfully')
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      console.log('Auth context: Getting initial session...')
      
      if (!supabase) {
        console.log('Auth context: No Supabase client, setting user to null')
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      try {
        console.log('Auth context: Calling supabase.auth.getSession()...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }

        console.log('Auth context: Session result:', { hasSession: !!session, hasUser: !!session?.user })

        if (mounted) {
          if (session?.user) {
            console.log('Auth context: User found, ensuring profile...')
            await ensureUserProfile(session.user)
            // Update hybrid storage auth state
            await hybridStorage.updateAuthState(true, session.user.id)
          } else {
            console.log('Auth context: No user, updating hybrid storage...')
            await hybridStorage.updateAuthState(false, null)
          }
          
          setUser(session?.user ?? null)
          setLoading(false)
          console.log('Auth context: Initialization complete')
        }
      } catch (error) {
        console.error('Failed to get initial session:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (!mounted) return

        try {
          if (session?.user) {
            await ensureUserProfile(session.user)
            // Update hybrid storage auth state
            await hybridStorage.updateAuthState(true, session.user.id)
          } else {
            await hybridStorage.updateAuthState(false, null)
          }

          setUser(session?.user ?? null)
          setLoading(false)

          // If user just signed in, migrate their data
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              await hybridStorage.migrateFromLocalStorage()
            } catch (error) {
              console.error('Failed to migrate data:', error)
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    
    if (error) return { error }
    
    // If signup successful, create user profile
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: name,
            timezone: 'UTC',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        
        if (profileError) {
          console.error('Failed to create user profile:', profileError)
          // Don't return error here as auth was successful
        }
      } catch (profileError) {
        console.error('Failed to create user profile:', profileError)
      }
    }
    
    return { error: null }
  }

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
      // Update hybrid storage auth state
      await hybridStorage.updateAuthState(false, null)
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
