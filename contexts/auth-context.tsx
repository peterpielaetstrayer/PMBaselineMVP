"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/client'
import {
  deriveSignUpResult,
  type AuthErrorResult,
  type SignUpResult,
} from '@/lib/auth/sign-up-result'
import type { User } from '@supabase/supabase-js'

const AUTH_INIT_TIMEOUT_MS = 8000

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthErrorResult | null }>
  signUp: (email: string, password: string, name: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthErrorResult | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[auth] start')

    const supabase = getBrowserClient()
    if (!supabase) {
      console.log('[auth] done', 'no-client')
      setLoading(false)
      return
    }

    let loadingCleared = false
    const clearLoading = (via: string) => {
      if (!loadingCleared) {
        loadingCleared = true
        console.log('[auth] done', via)
        setLoading(false)
      }
    }

    const timeoutId = window.setTimeout(() => {
      console.error('[auth] error', 'initial session check timed out')
      clearLoading('timeout')
    }, AUTH_INIT_TIMEOUT_MS)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[auth] session result', {
        source: 'onAuthStateChange',
        event,
        hasUser: !!session?.user,
      })
      setUser(session?.user ?? null)
      clearLoading(`onAuthStateChange:${event}`)
    })

    ;(async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        console.log('[auth] session result', {
          source: 'getSession',
          hasUser: !!session?.user,
          error: error?.message ?? null,
        })
        if (error) {
          console.error('[auth] error', error)
        }
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('[auth] error', error)
      } finally {
        window.clearTimeout(timeoutId)
        clearLoading('getSession')
      }
    })()

    return () => {
      window.clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const supabase = getBrowserClient()
    if (!supabase) {
      return { error: { message: 'Authentication is not configured' } }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error: error ? { message: error.message } : null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const supabase = getBrowserClient()
    if (!supabase) {
      return {
        ok: false,
        error: { message: 'Authentication is not configured' },
      } as const
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
      },
    })

    return deriveSignUpResult(
      email,
      error ? { message: error.message } : null,
      data.session
    )
  }

  const signOut = async () => {
    const supabase = getBrowserClient()
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const supabase = getBrowserClient()
    if (!supabase) {
      return { error: { message: 'Authentication is not configured' } }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    return { error: error ? { message: error.message } : null }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export type { AuthErrorResult, SignUpResult }
