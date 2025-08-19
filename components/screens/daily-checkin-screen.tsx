"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { AppState, AppScreen, CheckIn } from "@/lib/types"
import { PHYSICAL_MINIMUMS, MENTAL_MINIMUMS } from "@/lib/types"
import { storage } from "@/lib/storage"

interface DailyCheckinScreenProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
  navigateToScreen: (screen: AppScreen) => void
}

export function DailyCheckinScreen({ appState, updateAppState, navigateToScreen }: DailyCheckinScreenProps) {
  const [step, setStep] = useState<"landing" | "checkin" | "completion">("landing")
  const [physicalScore, setPhysicalScore] = useState(3)
  const [mentalScore, setMentalScore] = useState(3)
  const [minimumsMet, setMinimumsMet] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  
  // Load partial check-in if exists
  useEffect(() => {
    const partial = storage.getPartialCheckin()
    if (partial) {
      setPhysicalScore(partial.physical_score)
      setMentalScore(partial.mental_score)
      setMinimumsMet(partial.minimumsMet)
      setNotes(partial.notes || "")
      setStep("checkin")
    }
  }, [])
  
  // Auto-save partial check-in every 30 seconds
  useEffect(() => {
    if (step === "checkin") {
      const interval = setInterval(() => {
        storage.savePartialCheckin({
          physical_score: physicalScore,
          mental_score: mentalScore,
          minimums_met: minimumsMet,
          notes: notes,
          timestamp: Date.now()
        })
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [step, physicalScore, mentalScore, minimumsMet, notes])

  const currentStreak = storage.calculateStreak()
  const user = appState.user!

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getMotivationalMessage = () => {
    // Context-aware messages based on streak
    if (currentStreak === 0) {
      const messages = [
        "Ready to start your journey?",
        "Every expert was once a beginner",
        "Your first step creates momentum",
        "Let's build something beautiful together",
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    } else if (currentStreak < 7) {
      const messages = [
        "Building momentum, day by day",
        "You're finding your rhythm",
        "Consistency is your superpower",
        "Every day builds your foundation",
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    } else if (currentStreak < 21) {
      const messages = [
        "You're riding the wave of habit",
        "Your consistency is inspiring",
        "Finding your flow state",
        "Building unshakeable momentum",
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    } else if (currentStreak < 50) {
      const messages = [
        "You're a habit master in training",
        "Your dedication is remarkable",
        "Riding the wave of excellence",
        "Building something extraordinary",
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    } else {
      const messages = [
        "Certified readiness achieved! 🎉",
        "You're living the baseline life",
        "Master of your own rhythm",
        "Inspiring others with your consistency",
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    }
  }

  const handleMinimumToggle = (minimumId: string) => {
    setMinimumsMet((prev) => (prev.includes(minimumId) ? prev.filter((id) => id !== minimumId) : [...prev, minimumId]))
  }

  const handleCompleteCheckin = () => {
    const today = new Date().toISOString().split("T")[0]
    const checkin: CheckIn = {
      id: crypto.randomUUID(),
      user_id: user.id,
      date: today,
      physical_score: physicalScore,
      mental_score: mentalScore,
      minimums_met: minimumsMet,
      notes: notes.trim() || undefined,
      created_at: new Date(),
    }

    storage.addCheckin(checkin)
    storage.clearPartialCheckin() // Clear partial check-in

    // Update user streak
    const newStreak = storage.calculateStreak()
    const updatedUser = {
      ...user,
      streak_count: newStreak,
      total_checkins: user.total_checkins + 1,
    }
    storage.setUser(updatedUser)

    updateAppState({
      user: updatedUser,
      todayCheckin: checkin,
      checkins: storage.getCheckins(),
    })

    setStep("completion")
  }

  const handleFinish = () => {
    navigateToScreen("home")
  }

  if (step === "landing") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center wave-shadow">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-navy-text mb-2">
              {getGreeting()}, {user.name || "Surfer"}
            </h1>
            <p className="text-navy-text/70 mb-6">{getMotivationalMessage()}</p>

            <div className="bg-gradient-to-r from-ocean-light/20 to-ocean-deep/20 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-ocean-deep flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{currentStreak}</span>
                </div>
              </div>
              <p className="text-navy-text font-semibold">
                {currentStreak === 0 ? "Ready to start your journey" : `Day ${currentStreak} of your journey`}
              </p>
              <p className="text-sm text-navy-text/60 mt-1">
                {50 - currentStreak > 0
                  ? `${50 - currentStreak} days until certified readiness`
                  : "You've achieved certified readiness!"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setStep("checkin")}
              className="w-full bg-ocean-deep hover:bg-ocean-deep/90 text-white py-3 text-lg gentle-transition"
            >
              Check In Now
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateToScreen("home")}
              className="w-full border-ocean-light text-ocean-deep hover:bg-ocean-light/10"
            >
              Skip Today
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (step === "checkin") {
    const userMinimums = [
      ...PHYSICAL_MINIMUMS.filter((m) => user.selected_minimums.includes(m.id)),
      ...MENTAL_MINIMUMS.filter((m) => user.selected_minimums.includes(m.id)),
    ]

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 wave-shadow">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-navy-text mb-2">How's your baseline today?</h1>
            <p className="text-navy-text/70">Every check-in is valuable data</p>
          </div>

          <div className="space-y-8">
            {/* Physical Check-In */}
            <div>
              <h3 className="text-lg font-semibold text-navy-text mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-ocean-light/30 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-ocean-deep" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
                Physical Energy
              </h3>
              <div className="flex justify-between items-center mb-4">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => setPhysicalScore(score)}
                    className={`w-12 h-12 rounded-full border-2 gentle-transition ${
                      physicalScore === score
                        ? "border-ocean-deep bg-ocean-deep text-white"
                        : "border-gray-300 hover:border-ocean-light"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-navy-text/60">
                <span>Low energy</span>
                <span>High energy</span>
              </div>
            </div>

            {/* Mental Check-In */}
            <div>
              <h3 className="text-lg font-semibold text-navy-text mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-sun-accent/30 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
                Mental Clarity
              </h3>
              <div className="flex justify-between items-center mb-4">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => setMentalScore(score)}
                    className={`w-12 h-12 rounded-full border-2 gentle-transition ${
                      mentalScore === score
                        ? "border-sun-accent bg-sun-accent text-white"
                        : "border-gray-300 hover:border-sun-accent/50"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-navy-text/60">
                <span>Scattered</span>
                <span>Clear & focused</span>
              </div>
            </div>

            {/* Minimums Check */}
            <div>
              <h3 className="text-lg font-semibold text-navy-text mb-4">Your Daily Minimums</h3>
              <div className="grid gap-3">
                {userMinimums.map((minimum) => (
                  <div
                    key={minimum.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border gentle-transition cursor-pointer ${
                      minimumsMet.includes(minimum.id)
                        ? "border-success-green bg-success-green/10 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => handleMinimumToggle(minimum.id)}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center gentle-transition ${
                        minimumsMet.includes(minimum.id) ? "border-success-green bg-success-green scale-110" : "border-gray-300"
                      }`}
                    >
                      {minimumsMet.includes(minimum.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-lg">{minimum.icon}</span>
                    <span className={`text-navy-text ${minimumsMet.includes(minimum.id) ? "font-medium" : ""}`}>
                      {minimum.label}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Progress indicator */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-navy-text/70">Progress</span>
                  <span className="text-sm font-medium text-navy-text">
                    {minimumsMet.length}/{userMinimums.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-success-green to-success-green/80 h-2 rounded-full gentle-transition"
                    style={{ width: `${(minimumsMet.length / userMinimums.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-navy-text/60 mt-2">
                  {minimumsMet.length === 0
                    ? "Start with one - every small step matters!"
                    : minimumsMet.length === userMinimums.length
                    ? "All minimums completed! 🎉"
                    : `${userMinimums.length - minimumsMet.length} more to go`}
                </p>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <Label htmlFor="notes" className="text-navy-text font-medium mb-2 block">
                Anything you noticed today? (optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Feeling scattered? That's data too."
                className="resize-none"
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-navy-text/60 mt-1">{notes.length}/150 characters</p>
            </div>
          </div>

          <Button
            onClick={handleCompleteCheckin}
            className="w-full mt-8 bg-ocean-deep hover:bg-ocean-deep/90 text-white py-3 gentle-transition"
          >
            Complete Check-In
          </Button>
        </Card>
      </div>
    )
  }

  if (step === "completion") {
    const newStreak = storage.calculateStreak()
    const motivationalMessages = [
      "You showed up today - that's what matters!",
      "Steady progress, building momentum",
      "You're riding the wave of consistency",
      "Another day of alignment complete",
      "The waves are building with your rhythm",
    ]

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center wave-shadow">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-success-green/20 to-success-green/40 flex items-center justify-center">
              <svg className="w-10 h-10 text-success-green" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy-text mb-3">Check-In Complete!</h1>
            <p className="text-navy-text/70 mb-6">
              {motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}
            </p>

            <div className="bg-gradient-to-r from-ocean-light/20 to-ocean-deep/20 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-ocean-deep flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{newStreak}</span>
                </div>
              </div>
              <p className="text-navy-text font-semibold">Day {newStreak} complete</p>
              <p className="text-sm text-navy-text/60 mt-1">
                {50 - newStreak > 0
                  ? `${50 - newStreak} days until certified readiness`
                  : "You've achieved certified readiness!"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleFinish}
            className="w-full bg-ocean-deep hover:bg-ocean-deep/90 text-white py-3 gentle-transition"
          >
            Continue
          </Button>
        </Card>
      </div>
    )
  }

  return null
}
