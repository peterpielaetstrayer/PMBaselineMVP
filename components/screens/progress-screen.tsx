"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { AppState, AppScreen, CheckIn } from "@/lib/types"
import { storage } from "@/lib/storage"

const dateUtils = {
  format: (date: Date, formatStr: string): string => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const fullMonthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    switch (formatStr) {
      case "yyyy-MM-dd":
        return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
      case "MMM d":
        return `${monthNames[date.getMonth()]} ${day}`
      case "d":
        return day.toString()
      case "MMMM yyyy":
        return `${fullMonthNames[date.getMonth()]} ${year}`
      default:
        return date.toLocaleDateString()
    }
  },

  startOfWeek: (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
    return new Date(d.setDate(diff))
  },

  addDays: (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },

  subWeeks: (date: Date, weeks: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() - weeks * 7)
    return result
  },

  addWeeks: (date: Date, weeks: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + weeks * 7)
    return result
  },

  startOfMonth: (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  },

  endOfMonth: (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  },

  eachDayOfInterval: (interval: { start: Date; end: Date }): Date[] => {
    const days = []
    const current = new Date(interval.start)
    while (current <= interval.end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  },

  isSameDay: (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  },

  subMonths: (date: Date, months: number): Date => {
    const result = new Date(date)
    result.setMonth(result.getMonth() - months)
    return result
  },

  addMonths: (date: Date, months: number): Date => {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  },
}

interface ProgressScreenProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
  navigateToScreen: (screen: AppScreen) => void
}

export function ProgressScreen({ appState, navigateToScreen }: ProgressScreenProps) {
  const [view, setView] = useState<"week" | "month" | "insights">("week")
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const checkins = appState.checkins || []
  const streakInfo = storage.getStreakInfo()
  const currentStreak = streakInfo.currentStreak

  const getCheckinForDate = (date: Date): CheckIn | undefined => {
    const dateStr = dateUtils.format(date, "yyyy-MM-dd")
    return checkins.find((checkin) => checkin.date === dateStr)
  }

  const getWeekDays = (weekStart: Date) => {
    return Array.from({ length: 7 }, (_, i) => dateUtils.addDays(weekStart, i))
  }

  const getMonthDays = (month: Date) => {
    const start = dateUtils.startOfMonth(month)
    const end = dateUtils.endOfMonth(month)
    return dateUtils.eachDayOfInterval({ start, end })
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return "bg-success-green"
    if (score >= 3) return "bg-sun-accent"
    return "bg-warning-orange"
  }

  const getInsights = () => {
    if (checkins.length < 7) return []

    const insights = []
    const recentCheckins = checkins.slice(-14) // Last 2 weeks

    // Physical energy patterns
    const physicalScores = recentCheckins.map((c) => c.physical_score)
    const avgPhysical = physicalScores.reduce((a, b) => a + b, 0) / physicalScores.length

    if (avgPhysical >= 4) {
      insights.push("Your physical energy has been consistently strong")
    } else if (avgPhysical >= 3) {
      insights.push("You're maintaining steady physical energy")
    } else {
      insights.push("Consider gentle movement to boost your physical baseline")
    }

    // Mental clarity patterns
    const mentalScores = recentCheckins.map((c) => c.mental_score)
    const avgMental = mentalScores.reduce((a, b) => a + b, 0) / mentalScores.length

    if (avgMental >= 4) {
      insights.push("Your mental clarity is flowing beautifully")
    } else if (avgMental >= 3) {
      insights.push("You're finding good mental rhythm")
    } else {
      insights.push("Breathing exercises might help center your mind")
    }

    // Consistency patterns
    const completionRate = (checkins.length / Math.max(currentStreak, 1)) * 100
    if (completionRate >= 90) {
      insights.push("Your consistency is creating powerful momentum")
    } else if (completionRate >= 70) {
      insights.push("You're building a solid foundation of habits")
    }

    return insights
  }

  const renderWeekView = () => {
    const weekStart = dateUtils.startOfWeek(currentWeek)
    const weekDays = getWeekDays(weekStart)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(dateUtils.subWeeks(currentWeek, 1))}
            className="border-ocean-light text-ocean-deep"
          >
            ← Previous
          </Button>
          <h3 className="font-semibold text-navy-text">
            Week of {dateUtils.format(weekStart, "MMM d")} -{" "}
            {dateUtils.format(dateUtils.addDays(weekStart, 6), "MMM d")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(dateUtils.addWeeks(currentWeek, 1))}
            className="border-ocean-light text-ocean-deep"
            disabled={dateUtils.addWeeks(currentWeek, 1) > new Date()}
          >
            Next →
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-navy-text/70 p-2">
              {day}
            </div>
          ))}
          {weekDays.map((day) => {
            const checkin = getCheckinForDate(day)
            const isToday = dateUtils.isSameDay(day, new Date())
            const isFuture = day > new Date()

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square rounded-lg border-2 p-2 ${
                  isToday ? "border-ocean-deep" : "border-gray-200"
                } ${isFuture ? "opacity-50" : ""}`}
              >
                <div className="text-xs text-navy-text/70 mb-1">{dateUtils.format(day, "d")}</div>
                {checkin ? (
                  <div className="space-y-1">
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getScoreColor(checkin.physical_score)}`}></div>
                      <div className={`w-2 h-2 rounded-full ${getScoreColor(checkin.mental_score)}`}></div>
                    </div>
                    <div className="text-xs text-navy-text/60">
                      {checkin.minimums_met.length}/{appState.user?.selected_minimums.length || 0}
                    </div>
                  </div>
                ) : !isFuture ? (
                  <div className="text-xs text-gray-400">No check-in</div>
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="flex items-center space-x-4 text-xs text-navy-text/70">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-success-green"></div>
            <span>Strong (4-5)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-sun-accent"></div>
            <span>Steady (3)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-warning-orange"></div>
            <span>Gentle (1-2)</span>
          </div>
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const monthDays = getMonthDays(currentMonth)
    const monthStart = dateUtils.startOfMonth(currentMonth)

    // Pad the beginning of the month to align with Monday start
    const startDay = dateUtils.startOfWeek(monthStart)
    const paddingDays = []
    let current = startDay
    while (current < monthStart) {
      paddingDays.push(current)
      current = dateUtils.addDays(current, 1)
    }

    const allDays = [...paddingDays, ...monthDays]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(dateUtils.subMonths(currentMonth, 1))}
            className="border-ocean-light text-ocean-deep"
          >
            ← Previous
          </Button>
          <h3 className="font-semibold text-navy-text">{dateUtils.format(currentMonth, "MMMM yyyy")}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(dateUtils.addMonths(currentMonth, 1))}
            className="border-ocean-light text-ocean-deep"
            disabled={dateUtils.addMonths(currentMonth, 1) > new Date()}
          >
            Next →
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-navy-text/70 p-2">
              {day}
            </div>
          ))}
          {allDays.map((day) => {
            const checkin = getCheckinForDate(day)
            const isToday = dateUtils.isSameDay(day, new Date())
            const isCurrentMonth =
              day >= dateUtils.startOfMonth(currentMonth) && day <= dateUtils.endOfMonth(currentMonth)
            const isFuture = day > new Date()

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square rounded border p-1 text-center ${
                  isToday ? "border-ocean-deep bg-ocean-light/10" : "border-gray-200"
                } ${!isCurrentMonth ? "opacity-30" : ""} ${isFuture ? "opacity-50" : ""}`}
              >
                <div className={`text-xs ${isCurrentMonth ? "text-navy-text" : "text-gray-400"}`}>
                  {dateUtils.format(day, "d")}
                </div>
                {checkin && isCurrentMonth && (
                  <div className="w-2 h-2 rounded-full bg-success-green mx-auto mt-1"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderInsights = () => {
    const insights = getInsights()
    const totalCheckins = checkins.length
    const completionRate = totalCheckins > 0 ? (currentStreak / totalCheckins) * 100 : 0

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-ocean-deep mb-1">{totalCheckins}</div>
            <div className="text-sm text-navy-text/70">Total Check-ins</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success-green mb-1">{Math.round(completionRate)}%</div>
            <div className="text-sm text-navy-text/70">Consistency Rate</div>
          </Card>
        </div>

        {insights.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-navy-text mb-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-ocean-light/30 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-ocean-deep" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              Gentle Insights
            </h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-ocean-deep mt-2 flex-shrink-0"></div>
                  <p className="text-navy-text/80">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-navy-text mb-4">Milestone Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-navy-text/70">50-Day Certification</span>
              <span className="font-medium text-navy-text">{Math.min(currentStreak, 50)}/50</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-ocean-light to-ocean-deep h-3 rounded-full gentle-transition"
                style={{ width: `${Math.min((currentStreak / 50) * 100, 100)}%` }}
              ></div>
            </div>
            {currentStreak < 50 ? (
              <p className="text-sm text-navy-text/60">{50 - currentStreak} days until certified readiness</p>
            ) : (
              <p className="text-sm text-success-green font-medium">Certified readiness achieved! 🎉</p>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-8 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToScreen("home")}
            className="border-ocean-light text-ocean-deep"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-bold text-navy-text">Progress</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("week")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium gentle-transition ${
              view === "week" ? "bg-white text-ocean-deep shadow-sm" : "text-navy-text/70"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium gentle-transition ${
              view === "month" ? "bg-white text-ocean-deep shadow-sm" : "text-navy-text/70"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView("insights")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium gentle-transition ${
              view === "insights" ? "bg-white text-ocean-deep shadow-sm" : "text-navy-text/70"
            }`}
          >
            Insights
          </button>
        </div>

        {/* Current Streak Display */}
        <Card className="p-6 text-center wave-shadow">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ocean-light to-ocean-deep flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{currentStreak}</span>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-navy-text mb-1">
            {currentStreak === 1 ? "1 Day Streak" : `${currentStreak} Day Streak`}
          </h2>
          <p className="text-navy-text/70">
            {currentStreak === 0
              ? "Ready to start your journey"
              : currentStreak < 7
                ? "Building momentum"
                : currentStreak < 21
                  ? "Finding your rhythm"
                  : currentStreak < 50
                    ? "Riding the wave"
                    : "Certified readiness achieved!"}
          </p>
          
          {/* Grace Period Info */}
          {streakInfo.gracePeriodUsed > 0 && (
            <div className="mt-3 p-3 bg-ocean-light/20 rounded-lg">
              <p className="text-sm text-ocean-deep font-medium">
                💙 Grace period used: {streakInfo.gracePeriodUsed}/{streakInfo.maxGraceDays} days
              </p>
              <p className="text-xs text-navy-text/60 mt-1">
                Your streak continues thanks to gentle flexibility
              </p>
            </div>
          )}
          
          {/* Recovery Message */}
          {streakInfo.gracePeriodUsed > 0 && streakInfo.gracePeriodUsed < streakInfo.maxGraceDays && (
            <div className="mt-2 p-2 bg-success-green/20 rounded-lg">
              <p className="text-sm text-success-green font-medium">
                Welcome back! Your journey continues
              </p>
            </div>
          )}
        </Card>

        {/* View Content */}
        <Card className="p-6 wave-shadow">
          {view === "week" && renderWeekView()}
          {view === "month" && renderMonthView()}
          {view === "insights" && renderInsights()}
        </Card>
      </div>
    </div>
  )
}
