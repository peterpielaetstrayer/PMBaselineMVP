-- Create a view for weekly community check-in statistics
-- This view counts total check-ins from Monday 00:00 of current week to now

CREATE OR REPLACE VIEW weekly_community_stats AS
SELECT 
  COUNT(*) as total_checkins,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('week', CURRENT_DATE) as week_start
FROM checkins 
WHERE date::date >= DATE_TRUNC('week', CURRENT_DATE)::date
  AND date::date <= CURRENT_DATE;

-- Grant necessary permissions (views don't need RLS policies)
GRANT SELECT ON weekly_community_stats TO anon;
GRANT SELECT ON weekly_community_stats TO authenticated;
