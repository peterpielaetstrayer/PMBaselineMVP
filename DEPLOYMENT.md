# 🚀 Quick Deployment Guide

Get your PM Baseline app live in under 10 minutes!

## Option 1: Vercel (Recommended - 5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

**That's it!** Your app will be live at `https://your-project.vercel.app`

---

## Option 2: Netlify (Alternative - 7 minutes)

### Step 1: Build Locally
```bash
npm run build
```

### Step 2: Deploy on Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login
3. Drag & drop your `.next` folder
4. Wait for deployment

---

## Option 3: Manual Server (Advanced)

### Step 1: Build
```bash
npm run build
```

### Step 2: Deploy Files
Upload the `.next` folder and `package.json` to your server

### Step 3: Install & Start
```bash
npm install --production
npm start
```

---

## Post-Deployment Checklist

- [ ] Test all screens work
- [ ] Verify local storage works
- [ ] Check mobile responsiveness
- [ ] Test navigation between screens
- [ ] Verify data persistence

## Common Issues & Fixes

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### TypeScript Errors
```bash
# Check types
npm run type-check
```

### Styling Issues
```bash
# Rebuild CSS
npm run build
```

## Next Steps After Deployment

1. **Add Analytics** - Google Analytics or Vercel Analytics
2. **Set up Domain** - Custom domain in Vercel/Netlify
3. **Add Backend** - Supabase integration for user data
4. **Enable Notifications** - Browser push notifications
5. **Add Monitoring** - Error tracking with Sentry

## Support

If you run into issues:
1. Check the build logs in your deployment platform
2. Verify all dependencies are installed
3. Ensure Node.js version is 18+ 
4. Check the README.md for troubleshooting

---

**Your app is now live! 🎉**

Share the URL with friends and start building those daily habits!
