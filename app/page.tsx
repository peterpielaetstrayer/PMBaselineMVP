"use client"

import { useState, useEffect } from "react"
import type { AppState, AppScreen, User, CheckIn, Milestone } from "@/lib/types"
import { hybridStorage } from "@/lib/hybrid-storage"
import { useAuth } from "@/contexts/auth-context"
import { reminderService } from "@/lib/reminder-service"
import { WelcomeScreen } from "@/components/screens/welcome-screen"
import { BaselineSetupScreen } from "@/components/screens/baseline-setup-screen"
import { ReminderSetupScreen } from "@/components/screens/reminder-setup-screen"
import { DailyCheckinScreen } from "@/components/screens/daily-checkin-screen"
import { HomeScreen } from "@/components/screens/home-screen"
import { ProgressScreen } from "@/components/screens/progress-screen"
import { MilestoneScreen } from "@/components/screens/milestone-screen"
import { LoginScreen } from "@/components/screens/login-screen"

export default function PMBaselineApp() {
  const { user: authUser, loading: authLoading, signOut } = useAuth()
  const [appState, setAppState] = useState<AppState>({
    currentScreen: "welcome",
    user: null,
    todayCheckin: null,
    checkins: [],
    milestone: null,
  })
  const [showLogin, setShowLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      if (authLoading) return

      try {
        console.log('Initializing app...')
        
        // Initialize reminder service
        try {
          await reminderService.initialize()
          console.log('Reminder service initialized')
        } catch (error) {
          console.error('Failed to initialize reminder service:', error)
        }
        
        // Load app data with timeout
        const loadData = async () => {
          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Data load timeout')), 5000)
          )
          
          const dataPromise = (async () => {
            let user: User | null = null
            let checkins: CheckIn[] = []
            let todayCheckin: CheckIn | null = null
            let milestone: Milestone | null = null

            try {
              user = await hybridStorage.getUser()
              checkins = await hybridStorage.getCheckins()
              todayCheckin = await hybridStorage.getTodayCheckin()
              milestone = await hybridStorage.getMilestone()
            } catch (error) {
              console.error('Failed to load data:', error)
              // Use fallback values
            }

            return { user, checkins, todayCheckin, milestone }
          })()

          return Promise.race([dataPromise, timeout])
        }

        const { user, checkins, todayCheckin, milestone } = await loadData()

        // Determine initial screen
        let initialScreen: AppScreen = "welcome"
        if (user) {
          if (user.selected_minimums.length === 0) {
            initialScreen = "baseline-setup"
          } else if (!user.reminder_time) {
            initialScreen = "reminder-setup"
          } else if (!todayCheckin) {
            initialScreen = "daily-checkin"
          } else {
            initialScreen = "home"
          }
        }

        setAppState({
          currentScreen: initialScreen,
          user,
          todayCheckin,
          checkins,
          milestone,
        })
      } catch (error) {
        console.error('Failed to initialize app:', error)
        // Set default state
        setAppState({
          currentScreen: "welcome",
          user: null,
          todayCheckin: null,
          checkins: [],
          milestone: null,
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [authLoading, authUser])

  const updateAppState = async (updates: Partial<AppState>) => {
    const newState = { ...appState, ...updates }
    setAppState(newState)

    // Update storage
    if (updates.user) {
      await hybridStorage.setUser(updates.user)
    }
    if (updates.checkins) {
      for (const checkin of updates.checkins) {
        await hybridStorage.addCheckin(checkin)
      }
    }
    if (updates.milestone) {
      await hybridStorage.setMilestone(updates.milestone)
    }
  }

  const navigateToScreen = (screen: AppScreen) => {
    setAppState((prev) => ({ ...prev, currentScreen: screen }))
  }

  const handleLoginSuccess = () => {
    setShowLogin(false)
    // The auth context will handle the state update automatically
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-light/20 to-ocean-deep/10 flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="wave-spinner mx-auto mb-6"></div>
          <p className="text-navy-text/60 floating-animation">
            Loading your baseline...
          </p>
          <p className="text-xs text-navy-text/40 mt-2">
            Auth: {authLoading ? 'Loading' : 'Ready'} | App: {isLoading ? 'Loading' : 'Ready'}
          </p>
        </div>
      </div>
    )
  }

  if (showLogin) {
    return (
      <LoginScreen
        onSuccess={handleLoginSuccess}
        onBack={() => setShowLogin(false)}
      />
    )
  }

  const screenProps = {
    appState,
    updateAppState,
    navigateToScreen,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-light/20 to-ocean-deep/10">
      {/* Header with auth status */}
      <div className="absolute top-4 right-4 z-10">
        {authUser ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-navy-text/70">
              {authUser.email}
            </span>
            <button
              onClick={signOut}
              className="text-xs text-navy-text/50 hover:text-navy-text/70"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="text-sm text-navy-text/70 hover:text-navy-text/90 underline"
          >
            Sign In / Sign Up
          </button>
        )}
      </div>

      <div className="slide-in-up">
        {appState.currentScreen === "welcome" && <WelcomeScreen {...screenProps} />}
        {appState.currentScreen === "baseline-setup" && <BaselineSetupScreen {...screenProps} />}
        {appState.currentScreen === "reminder-setup" && <ReminderSetupScreen {...screenProps} />}
        {appState.currentScreen === "daily-checkin" && <DailyCheckinScreen {...screenProps} />}
        {appState.currentScreen === "home" && <HomeScreen {...screenProps} />}
        {appState.currentScreen === "progress" && <ProgressScreen {...screenProps} />}
        {appState.currentScreen === "milestone" && <MilestoneScreen {...screenProps} />}
      </div>
    </div>
  )
}
