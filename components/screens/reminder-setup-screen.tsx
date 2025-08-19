"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { AppState, AppScreen } from "@/lib/types"
import { storage } from "@/lib/storage"

interface ReminderSetupScreenProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
  navigateToScreen: (screen: AppScreen) => void
}

export function ReminderSetupScreen({ appState, updateAppState, navigateToScreen }: ReminderSetupScreenProps) {
  const [morningTime, setMorningTime] = useState("08:00")
  const [enableEvening, setEnableEvening] = useState(false)
  const [eveningTime, setEveningTime] = useState("20:00")

  const handleComplete = () => {
    if (!appState.user) return

    const updatedUser = {
      ...appState.user,
      reminder_time: morningTime,
    }

    storage.setUser(updatedUser)
    updateAppState({ user: updatedUser })
    navigateToScreen("daily-checkin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 wave-shadow">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-sun-accent/30 to-sun-accent/60 flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy-text mb-2">When should we check in?</h1>
          <p className="text-navy-text/70">We'll send a gentle nudge, never pressure</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="morning-time" className="text-navy-text font-medium mb-2 block">
              Morning Reflection
            </Label>
            <Input
              id="morning-time"
              type="time"
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-navy-text/60 mt-1">Best time for your daily check-in</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Checkbox checked={enableEvening} onCheckedChange={setEnableEvening} />
              <Label className="text-navy-text font-medium">Optional evening reminder</Label>
            </div>

            {enableEvening && (
              <div>
                <Label htmlFor="evening-time" className="text-navy-text font-medium mb-2 block">
                  Evening Reflection
                </Label>
                <Input
                  id="evening-time"
                  type="time"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-navy-text/60 mt-1">Time to reflect on your day</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-ocean-light/10 rounded-lg p-4 border border-ocean-light/30">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-ocean-deep/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-ocean-deep" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-navy-text">Gentle Approach</p>
                <p className="text-xs text-navy-text/70 mt-1">
                  Our reminders are supportive nudges, not demands. You're always in control of your journey.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleComplete}
            className="w-full bg-ocean-deep hover:bg-ocean-deep/90 text-white py-3 gentle-transition"
          >
            Complete Setup
          </Button>
        </div>
      </Card>
    </div>
  )
}
