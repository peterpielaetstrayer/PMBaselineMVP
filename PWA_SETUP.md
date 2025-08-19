# PM Baseline PWA Setup Guide

## 🚀 Progressive Web App Features

Your PM Baseline app is now a **Progressive Web App (PWA)** that can be installed on Android devices!

## ✨ What This Gives You

### **Installable App**
- **Android**: Users can "Add to Home Screen" from Chrome
- **iOS**: Users can "Add to Home Screen" from Safari
- **Desktop**: Users can install as a desktop app

### **Offline Functionality**
- App works without internet connection
- Data stored locally on device
- Graceful offline experience

### **Daily Reminders**
- **Browser notifications** at your chosen time
- **Smart reminders** - only sends if you haven't checked in
- **Snooze functionality** - remind later if needed
- **Test button** to verify notifications work

## 📱 How to Install on Android

1. **Open the app** in Chrome on your Android device
2. **Tap the menu** (three dots) in Chrome
3. **Select "Add to Home Screen"**
4. **Choose app name** and tap "Add"
5. **App appears** on your home screen like a native app!

## 🔔 Setting Up Daily Reminders

1. **Complete onboarding** and set your reminder time
2. **Allow notifications** when prompted
3. **Reminders will send daily** at your chosen time
4. **Use "Test Reminder" button** to verify it works

## 🛠️ Technical Details

### **Files Added**
- `public/manifest.json` - PWA configuration
- `public/sw.js` - Service worker for offline/notifications
- `public/offline.html` - Offline fallback page
- `public/icon-192.svg` & `icon-512.svg` - App icons
- `lib/reminder-service.ts` - Reminder management

### **Features**
- **Service Worker**: Handles offline caching and notifications
- **Manifest**: Defines app appearance and behavior
- **Reminder Service**: Manages daily notification scheduling
- **Offline Support**: Graceful fallback when offline

## 🔧 Troubleshooting

### **Reminders Not Working?**
1. Check notification permissions in browser settings
2. Use "Test Reminder" button to verify
3. Ensure app is running in background
4. Check browser console for errors

### **PWA Not Installable?**
1. Ensure HTTPS (required for PWA)
2. Check manifest.json is accessible
3. Verify service worker is registered
4. Clear browser cache and try again

### **Offline Issues?**
1. Check service worker registration
2. Verify offline.html is accessible
3. Check browser console for errors

## 🎯 Next Steps

### **Enhancements You Could Add**
- **Push notifications** via server
- **Background sync** for data
- **App shortcuts** for quick actions
- **Share API** integration
- **Badge API** for unread counts

### **Native App Conversion**
- **Capacitor**: Wrap current web app
- **React Native**: Rewrite for native performance
- **Tauri**: Desktop app with Rust backend

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

**Your app is now a full-featured PWA!** Users can install it, get offline access, and receive daily reminders - all from the web! 🎉
