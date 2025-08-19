"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { AppState, AppScreen } from "@/lib/types"

interface WelcomeScreenProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
  navigateToScreen: (screen: AppScreen) => void
}

export function WelcomeScreen({ navigateToScreen }: WelcomeScreenProps) {
  const handleStartJourney = () => {
    navigateToScreen("baseline-setup")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center wave-shadow">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-ocean-light to-ocean-deep flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy-text mb-3">Welcome to PMBaseline</h1>
          <p className="text-lg text-navy-text/80 mb-2">Where daily alignment creates momentum</p>
          <p className="text-sm text-navy-text/60">Completed the 10-day texting course? Continue your journey here.</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-ocean-light/20 via-ocean-deep/20 to-ocean-light/20 rounded-lg blur-sm"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-ocean-light/30">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-ocean-light/30 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-ocean-deep" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-navy-text">Daily Check-ins</p>
                  <p className="text-xs text-navy-text/60">Track your baseline habits</p>
                </div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-sun-accent/30 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-navy-text">50-Day Streaks</p>
                  <p className="text-xs text-navy-text/60">Unlock growth opportunities</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-success-green/30 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-success-green" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8-1.41-1.42z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-navy-text">Gentle Accountability</p>
                  <p className="text-xs text-navy-text/60">Return-focused, not perfection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartJourney}
          className="w-full bg-ocean-deep hover:bg-ocean-deep/90 text-white py-3 text-lg gentle-transition"
        >
          Start My Baseline Journey
        </Button>

        <p className="text-xs text-navy-text/50 mt-4">Riding the waves of daily alignment</p>
      </Card>
    </div>
  )
}
