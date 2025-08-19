"use client"

import { useState, useEffect } from "react"
import type { AppState, AppScreen } from "@/lib/types"
import { storage } from "@/lib/storage"
import { WelcomeScreen } from "@/components/screens/welcome-screen"
import { BaselineSetupScreen } from "@/components/screens/baseline-setup-screen"
import { ReminderSetupScreen } from "@/components/screens/reminder-setup-screen"
import { DailyCheckinScreen } from "@/components/screens/daily-checkin-screen"
import { HomeScreen } from "@/components/screens/home-screen"
import { ProgressScreen } from "@/components/screens/progress-screen"
import { MilestoneScreen } from "@/components/screens/milestone-screen"

export default function PMBaselineApp() {
  const [appState, setAppState] = useState<AppState>({
    currentScreen: "welcome",
    user: null,
    todayCheckin: null,
    checkins: [],
    milestone: null,
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = storage.getUser()
    const checkins = storage.getCheckins()
    const todayCheckin = storage.getTodayCheckin()
    const milestone = storage.getMilestone()

    // Determine initial screen based on user state
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

    setIsLoading(false)
  }, [])

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...updates }))
  }

  const navigateToScreen = (screen: AppScreen) => {
    setAppState((prev) => ({ ...prev, currentScreen: screen }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-light/20 to-ocean-deep/10 flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="wave-spinner mx-auto mb-6"></div>
          <p className="text-navy-text/60 floating-animation">Loading your baseline...</p>
        </div>
      </div>
    )
  }

  const screenProps = {
    appState,
    updateAppState,
    navigateToScreen,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-light/20 to-ocean-deep/10">
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
