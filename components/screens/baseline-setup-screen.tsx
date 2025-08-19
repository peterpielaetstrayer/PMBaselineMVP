"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { AppState, AppScreen } from "@/lib/types"
import { PHYSICAL_MINIMUMS, MENTAL_MINIMUMS } from "@/lib/types"
import { storage } from "@/lib/storage"

interface BaselineSetupScreenProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
  navigateToScreen: (screen: AppScreen) => void
}

export function BaselineSetupScreen({ appState, updateAppState, navigateToScreen }: BaselineSetupScreenProps) {
  const [selectedMinimums, setSelectedMinimums] = useState<string[]>(appState.user?.selected_minimums || [])

  const handleMinimumToggle = (minimumId: string) => {
    setSelectedMinimums((prev) => {
      if (prev.includes(minimumId)) {
        return prev.filter((id) => id !== minimumId)
      } else if (prev.length < 5) {
        return [...prev, minimumId]
      }
      return prev
    })
  }

  const handleContinue = () => {
    if (selectedMinimums.length < 3) return

    const user = appState.user || {
      id: crypto.randomUUID(),
      name: "User",
      email: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      created_at: new Date(),
      selected_minimums: [],
      reminder_time: "",
      streak_count: 0,
      total_checkins: 0,
      is_certified: false,
    }

    const updatedUser = {
      ...user,
      selected_minimums: selectedMinimums,
    }

    storage.setUser(updatedUser)
    updateAppState({ user: updatedUser })
    navigateToScreen("reminder-setup")
  }

  const canContinue = selectedMinimums.length >= 3 && selectedMinimums.length <= 5

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 wave-shadow">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-text mb-2">Choose Your Daily Minimums</h1>
          <p className="text-navy-text/70">Select 3-5 simple habits that feel sustainable every day</p>
          <p className="text-sm text-navy-text/50 mt-2">Remember: 1 push-up counts, 5 minutes counts</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-navy-text mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-ocean-light/30 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-ocean-deep" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              Physical
            </h3>
            <div className="grid gap-3">
              {PHYSICAL_MINIMUMS.map((minimum) => (
                <div
                  key={minimum.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border gentle-transition cursor-pointer ${
                    selectedMinimums.includes(minimum.id)
                      ? "border-ocean-deep bg-ocean-light/10"
                      : "border-gray-200 hover:border-ocean-light"
                  }`}
                  onClick={() => handleMinimumToggle(minimum.id)}
                >
                  <Checkbox
                    checked={selectedMinimums.includes(minimum.id)}
                    onCheckedChange={() => handleMinimumToggle(minimum.id)}
                  />
                  <span className="text-2xl">{minimum.icon}</span>
                  <span className="text-navy-text font-medium">{minimum.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-navy-text mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-sun-accent/30 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              Mental
            </h3>
            <div className="grid gap-3">
              {MENTAL_MINIMUMS.map((minimum) => (
                <div
                  key={minimum.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border gentle-transition cursor-pointer ${
                    selectedMinimums.includes(minimum.id)
                      ? "border-ocean-deep bg-ocean-light/10"
                      : "border-gray-200 hover:border-ocean-light"
                  }`}
                  onClick={() => handleMinimumToggle(minimum.id)}
                >
                  <Checkbox
                    checked={selectedMinimums.includes(minimum.id)}
                    onCheckedChange={() => handleMinimumToggle(minimum.id)}
                  />
                  <span className="text-2xl">{minimum.icon}</span>
                  <span className="text-navy-text font-medium">{minimum.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-sm text-navy-text/60">Selected: {selectedMinimums.length}/5 minimums</p>
            {selectedMinimums.length < 3 && (
              <p className="text-sm text-warning-orange mt-1">Choose at least 3 minimums to continue</p>
            )}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full bg-ocean-deep hover:bg-ocean-deep/90 disabled:bg-gray-300 disabled:text-gray-500 text-white py-3 gentle-transition"
          >
            Continue Setup
          </Button>
        </div>
      </Card>
    </div>
  )
}
