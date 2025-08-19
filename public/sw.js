const CACHE_NAME = 'pm-baseline-v1'
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
          })
      })
  )
})

// Background sync for reminders
self.addEventListener('sync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder())
  }
})

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your daily check-in!',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [200, 100, 200],
    data: {
      date: new Date().toISOString()
    },
    actions: [
      {
        action: 'checkin',
        title: 'Check In Now',
        icon: '/icon-192.png'
      },
      {
        action: 'snooze',
        title: 'Remind Later',
        icon: '/icon-192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('PM Baseline', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'checkin') {
    // Open the app to check-in
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'snooze') {
    // Schedule reminder for 1 hour later
    event.waitUntil(
      scheduleReminder(60 * 60 * 1000) // 1 hour
    )
  } else {
    // Default click - open app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Send daily reminder
async function sendDailyReminder() {
  try {
    // Check if user has already checked in today
    const today = new Date().toISOString().split('T')[0]
    
    // Get stored check-ins from IndexedDB or localStorage
    const checkins = await getStoredCheckins()
    const hasCheckedInToday = checkins.some(checkin => checkin.date === today)
    
    if (!hasCheckedInToday) {
      // Send notification
      await self.registration.showNotification('PM Baseline', {
        body: 'Time for your daily check-in! Build your foundation today.',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
          {
            action: 'checkin',
            title: 'Check In Now',
            icon: '/icon-192.svg'
          },
          {
            action: 'snooze',
            title: 'Remind Later',
            icon: '/icon-192.svg'
          }
        ]
      })
    }
  } catch (error) {
    console.error('Failed to send daily reminder:', error)
  }
}

// Schedule reminder for later
async function scheduleReminder(delay) {
  try {
    const reminderTime = Date.now() + delay
    
    // Store reminder in IndexedDB
    await storeReminder({
      id: Date.now(),
      time: reminderTime,
      type: 'snooze'
    })
    
    // Schedule the reminder
    setTimeout(() => {
      self.registration.showNotification('PM Baseline', {
        body: 'Reminder: Time for your check-in!',
        icon: '/icon-192.svg',
        requireInteraction: true
      })
    }, delay)
  } catch (error) {
    console.error('Failed to schedule reminder:', error)
  }
}

// Helper functions for data access
async function getStoredCheckins() {
  try {
    // Try to get from localStorage via postMessage
    const response = await new Promise((resolve) => {
      const channel = new MessageChannel()
      channel.port1.onmessage = (event) => resolve(event.data)
      channel.port2.postMessage({ type: 'GET_CHECKINS' })
    })
    return response || []
  } catch (error) {
    console.error('Failed to get checkins:', error)
    return []
  }
}

async function storeReminder(reminder) {
  try {
    // Store in IndexedDB
    const db = await openDB()
    const tx = db.transaction('reminders', 'readwrite')
    const store = tx.objectStore('reminders')
    await store.add(reminder)
  } catch (error) {
    console.error('Failed to store reminder:', error)
  }
}

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PMBaselineDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('reminders')) {
        db.createObjectStore('reminders', { keyPath: 'id' })
      }
    }
  })
}
