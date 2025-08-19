export class ReminderService {
  private static instance: ReminderService
  private reminderTime: string | null = null
  private isInitialized = false

  static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService()
    }
    return ReminderService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Check if service worker is supported
      if ('serviceWorker' in navigator && 'Notification' in window) {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)

        // Request notification permission
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission()
          console.log('Notification permission:', permission)
        }

        // Load saved reminder time
        this.reminderTime = localStorage.getItem('pmbaseline_reminder_time')
        
        // Schedule daily reminder if time is set
        if (this.reminderTime) {
          this.scheduleDailyReminder()
        }

        this.isInitialized = true
      }
    } catch (error) {
      console.error('Failed to initialize reminder service:', error)
    }
  }

  async setReminderTime(time: string): Promise<boolean> {
    try {
      this.reminderTime = time
      localStorage.setItem('pmbaseline_reminder_time', time)
      
      // Schedule the reminder
      this.scheduleDailyReminder()
      
      return true
    } catch (error) {
      console.error('Failed to set reminder time:', error)
      return false
    }
  }

  getReminderTime(): string | null {
    return this.reminderTime
  }

  private scheduleDailyReminder(): void {
    if (!this.reminderTime) return

    try {
      // Parse reminder time (format: "HH:MM")
      const [hours, minutes] = this.reminderTime.split(':').map(Number)
      
      // Calculate next reminder time
      const now = new Date()
      const nextReminder = new Date()
      nextReminder.setHours(hours, minutes, 0, 0)
      
      // If today's reminder time has passed, schedule for tomorrow
      if (nextReminder <= now) {
        nextReminder.setDate(nextReminder.getDate() + 1)
      }
      
      const delay = nextReminder.getTime() - now.getTime()
      
      console.log(`Scheduling daily reminder for ${this.reminderTime}, next reminder in ${Math.round(delay / 1000 / 60)} minutes`)
      
      // Schedule the reminder
      setTimeout(() => {
        this.sendDailyReminder()
        // Schedule next day's reminder
        this.scheduleDailyReminder()
      }, delay)
      
    } catch (error) {
      console.error('Failed to schedule daily reminder:', error)
    }
  }

  private async sendDailyReminder(): Promise<void> {
    try {
      // Check if user has already checked in today
      const today = new Date().toISOString().split('T')[0]
      const checkins = this.getStoredCheckins()
      const hasCheckedInToday = checkins.some(checkin => checkin.date === today)
      
      if (!hasCheckedInToday && Notification.permission === 'granted') {
        // Send notification
        const notification = new Notification('PM Baseline', {
          body: 'Time for your daily check-in! Build your foundation today.',
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          tag: 'daily-reminder',
          data: {
            type: 'daily-reminder',
            date: today
          }
        })

        // Handle notification click
        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        console.log('Daily reminder sent')
      } else if (hasCheckedInToday) {
        console.log('User already checked in today, skipping reminder')
      }
    } catch (error) {
      console.error('Failed to send daily reminder:', error)
    }
  }

  private getStoredCheckins(): any[] {
    try {
      const stored = localStorage.getItem('pmbaseline_checkins')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get stored checkins:', error)
      return []
    }
  }

  async testReminder(): Promise<void> {
    if (Notification.permission === 'granted') {
      const notification = new Notification('PM Baseline - Test', {
        body: 'This is a test reminder! Your reminder system is working.',
        icon: '/icon-192.svg',
        requireInteraction: true
      })
      
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } else {
      console.log('Notification permission not granted')
    }
  }

  async clearReminder(): Promise<void> {
    this.reminderTime = null
    localStorage.removeItem('pmbaseline_reminder_time')
    console.log('Reminder cleared')
  }
}

export const reminderService = ReminderService.getInstance()
