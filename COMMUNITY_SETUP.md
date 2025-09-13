# Community Counter Setup Guide

## Database Setup

To enable the community counter feature, you need to run the SQL commands in your Supabase database:

### 1. Run the SQL Script

Execute the contents of `supabase/community-stats.sql` in your Supabase SQL editor:

```sql
-- Create a view for weekly community check-in statistics
CREATE OR REPLACE VIEW weekly_community_stats AS
SELECT 
  COUNT(*) as total_checkins,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('week', CURRENT_DATE) as week_start
FROM checkins 
WHERE date >= DATE_TRUNC('week', CURRENT_DATE)
  AND date <= CURRENT_DATE;

-- Enable RLS on the view
ALTER VIEW weekly_community_stats SET (security_invoker = true);

-- Create RLS policy to allow public read access (no PII exposed)
CREATE POLICY "Allow public read access to weekly stats" ON weekly_community_stats
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON weekly_community_stats TO anon;
GRANT SELECT ON weekly_community_stats TO authenticated;
```

### 2. Verify the Setup

After running the SQL, you can test the API endpoint:

```bash
curl http://localhost:3003/api/stats/weekly
```

Expected response:
```json
{
  "totalCheckins": 0,
  "uniqueUsers": 0,
  "weekStart": "2024-01-01T00:00:00.000Z"
}
```

## Features Added

### 1. **Community Counter Component**
- Shows total weekly check-ins from the community
- Displays number of unique users participating
- Auto-refreshes every 5 minutes
- Graceful error handling with fallback display

### 2. **Database View**
- `weekly_community_stats` view counts check-ins from Monday 00:00 to now
- Secure RLS policies allow public read access without exposing PII
- Only shows aggregate counts, no individual user data

### 3. **API Endpoint**
- `/api/stats/weekly` provides the community statistics
- Proper error handling and fallback responses
- Cached data with 5-minute refresh intervals

### 4. **UI Integration**
- Added to Welcome Screen (for new users)
- Added to Home Screen (for existing users)
- Consistent styling with app theme
- Responsive design

## Security

- **No PII exposed**: Only aggregate counts are visible
- **RLS enabled**: Row Level Security prevents data leakage
- **Public read access**: Safe to show community stats publicly
- **No user identification**: Individual users cannot be identified

## Community Feeling

The counter creates a sense of community by:
- Showing users they're part of a larger movement
- Displaying real-time participation numbers
- Creating social proof and motivation
- Building momentum through collective progress

The messaging emphasizes "community" and "movement" rather than individual tracking, making users feel connected to others on the same journey.
