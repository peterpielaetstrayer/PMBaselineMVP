# PM Baseline App

A habit tracking application focused on building consistent daily physical and mental minimums. Track your progress, build streaks, and achieve milestones.

## Features

- **Daily Check-ins**: Track physical and mental minimums daily
- **Progress Tracking**: Visual progress charts and streak counting
- **Milestone System**: Celebrate achievements at 50-day streaks
- **Responsive Design**: Works on all devices
- **Local Storage**: Data persists in your browser

## Tech Stack

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: React hooks + local storage
- **Deployment**: Vercel-ready

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

### Deployment

#### Option 1: Vercel (Recommended - 5 minutes)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy automatically

#### Option 2: Manual Build

```bash
# Build the app
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_APP_NAME="PM Baseline"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

## Project Structure

```
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main app component
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── screens/           # Main app screens
│   └── ui/                # Reusable UI components
├── lib/                    # Utilities and types
│   ├── types.ts           # TypeScript interfaces
│   └── storage.ts         # Local storage utilities
└── styles/                 # Additional styles
```

## Next Steps for Production

1. **Add Backend**: Integrate Supabase for user authentication and data persistence
2. **Analytics**: Add user behavior tracking
3. **Notifications**: Implement reminder notifications
4. **Mobile App**: Convert to React Native or PWA
5. **Social Features**: Add friend challenges and leaderboards

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
