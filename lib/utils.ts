import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Enhanced cn function that handles conditional classes properly
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Date utility functions for progress tracking
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export function getStreakData(checkins: Array<{ date: string }>) {
  if (checkins.length === 0) return { current: 0, longest: 0, streaks: [] }

  // Sort checkins by date (most recent first)
  const sortedCheckins = checkins
    .map((c) => ({ ...c, dateObj: new Date(c.date) }))
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  const streaks: Array<{ start: string; end: string; length: number }> = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate current streak
  for (let i = 0; i < sortedCheckins.length; i++) {
    const checkinDate = new Date(sortedCheckins[i].date)
    checkinDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)

    if (checkinDate.getTime() === expectedDate.getTime()) {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate all streaks for historical data
  let streakStart = sortedCheckins[0]?.date
  tempStreak = 1

  for (let i = 1; i < sortedCheckins.length; i++) {
    const currentDate = new Date(sortedCheckins[i].date)
    const previousDate = new Date(sortedCheckins[i - 1].date)

    const dayDifference = Math.abs((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDifference === 1) {
      tempStreak++
    } else {
      if (tempStreak > 1) {
        streaks.push({
          start: sortedCheckins[i - 1].date,
          end: streakStart!,
          length: tempStreak,
        })
      }
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
      streakStart = sortedCheckins[i].date
    }
  }

  // Don't forget the last streak
  if (tempStreak > 1) {
    streaks.push({
      start: sortedCheckins[sortedCheckins.length - 1].date,
      end: streakStart!,
      length: tempStreak,
    })
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return {
    current: currentStreak,
    longest: longestStreak,
    streaks: streaks.reverse(), // Oldest first
  }
}
