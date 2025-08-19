"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { AppState, AppScreen } from "@/lib/types"
import { PHYSICAL_MINIMUMS, MENTAL_MINIMUMS } from "@/lib/types"
import { storage } from "@/lib/storage"

interface HomeScreenProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
  navigateToScreen: (screen: AppScreen) => void
}

export function HomeScreen({ appState, navigateToScreen }: HomeScreenProps) {
  const user = appState.user!
  const todayCheckin = appState.todayCheckin
  const currentStreak = storage.calculateStreak()

  const getStreakMessage = () => {
    if (currentStreak === 0) return "Ready to start your journey"
    if (currentStreak < 7) return "Building momentum"
    if (currentStreak < 21) return "Finding your rhythm"
    if (currentStreak < 50) return "Riding the wave"
    return "Certified readiness achieved!"
  }

  const getUserMinimums = () => {
    return [
      ...PHYSICAL_MINIMUMS.filter((m) => user.selected_minimums.includes(m.id)),
      ...MENTAL_MINIMUMS.filter((m) => user.selected_minimums.includes(m.id)),
    ]
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-success-green"
    if (score >= 3) return "text-sun-accent"
    return "text-warning-orange"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 4) return "Strong"
    if (score >= 3) return "Steady"
    return "Gentle"
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8 pb-4 fade-in">
          <h1 className="text-2xl font-bold text-navy-text mb-2">Your Baseline</h1>
          <p className="text-navy-text/70">{getStreakMessage()}</p>
        </div>

        {/* Streak Dashboard */}
        <Card className="p-6 wave-shadow pulse-glow scale-in">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ocean-light to-ocean-deep flex items-center justify-center streak-counter floating-animation">
                <span className="text-3xl font-bold text-white">{currentStreak}</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-navy-text mb-2">
              {currentStreak === 1 ? "1 Day" : `${currentStreak} Days`}
            </h2>
            <p className="text-navy-text/70 mb-4">Current streak</p>

            <div className="bg-ocean-light/10 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-navy-text/70">Progress to certification</span>
                <span className="text-sm font-medium text-navy-text">{Math.min(currentStreak, 50)}/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 progress-wave">
                <div
                  className="bg-gradient-to-r from-ocean-light to-ocean-deep h-2 rounded-full gentle-transition"
                  style={{ width: `${Math.min((currentStreak / 50) * 100, 100)}%` }}
                ></div>
              </div>
              {currentStreak < 50 && (
                <p className="text-xs text-navy-text/60 mt-2">{50 - currentStreak} days until certified readiness</p>
              )}
            </div>
          </div>
        </Card>

        {/* Today's Summary */}
        {todayCheckin && (
          <Card className="p-6 wave-shadow slide-in-up">
            <h3 className="text-lg font-semibold text-navy-text mb-4">Today's Check-In</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-ocean-light/30 flex items-center justify-center floating-animation">
                    <svg className="w-4 h-4 text-ocean-deep" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  </div>
                  <span className="text-navy-text">Physical Energy</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${getScoreColor(todayCheckin.physical_score)}`}>
                    {todayCheckin.physical_score}/5
                  </span>
                  <p className="text-xs text-navy-text/60">{getScoreLabel(todayCheckin.physical_score)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-sun-accent/30 flex items-center justify-center floating-animation">
                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  </div>
                  <span className="text-navy-text">Mental Clarity</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${getScoreColor(todayCheckin.mental_score)}`}>
                    {todayCheckin.mental_score}/5
                  </span>
                  <p className="text-xs text-navy-text/60">{getScoreLabel(todayCheckin.mental_score)}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-navy-text/70 mb-2">Minimums completed:</p>
                <div className="flex flex-wrap gap-2">
                  {getUserMinimums().map((minimum) => (
                    <div
                      key={minimum.id}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs gentle-transition ${
                        todayCheckin.minimums_met.includes(minimum.id)
                          ? "bg-success-green/10 text-success-green border border-success-green/20 scale-in"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span>{minimum.icon}</span>
                      <span>{minimum.label.split(" ")[0]}</span>
                      {todayCheckin.minimums_met.includes(minimum.id) && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {todayCheckin.notes && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-navy-text/70 mb-1">Today's reflection:</p>
                  <p className="text-sm text-navy-text italic">"{todayCheckin.notes}"</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6 wave-shadow slide-in-up">
          <h3 className="text-lg font-semibold text-navy-text mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {!todayCheckin && (
              <Button
                onClick={() => navigateToScreen("daily-checkin")}
                className="w-full bg-ocean-deep hover:bg-ocean-deep/90 text-white gentle-transition"
              >
                Complete Today's Check-In
              </Button>
            )}

            {todayCheckin && (
              <Button
                onClick={() => navigateToScreen("daily-checkin")}
                variant="outline"
                className="w-full border-ocean-light text-ocean-deep hover:bg-ocean-light/10"
              >
                Update Today's Check-In
              </Button>
            )}

            <Button
              onClick={() => navigateToScreen("progress")}
              variant="outline"
              className="w-full border-ocean-light text-ocean-deep hover:bg-ocean-light/10"
            >
              View Progress History
            </Button>

            {currentStreak >= 50 && (
              <Button
                onClick={() => navigateToScreen("milestone")}
                className="w-full bg-success-green hover:bg-success-green/90 text-white gentle-transition pulse-glow"
              >
                Claim Your Milestone
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
