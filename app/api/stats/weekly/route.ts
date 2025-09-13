import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('API: Fetching weekly stats...')
    
    if (!supabase) {
      console.log('API: Supabase not configured, returning fallback data')
      return NextResponse.json({
        totalCheckins: 0,
        uniqueUsers: 0,
        weekStart: null,
        fallback: true
      })
    }

    console.log('API: Supabase client available, querying database...')
    
    const { data, error } = await supabase
      .from('weekly_community_stats')
      .select('*')
      .single()

    if (error) {
      console.error('API: Error fetching weekly stats:', error)
      // Return fallback data instead of error
      return NextResponse.json({
        totalCheckins: 0,
        uniqueUsers: 0,
        weekStart: null,
        error: error.message
      })
    }

    console.log('API: Successfully fetched stats:', data)

    return NextResponse.json({
      totalCheckins: data?.total_checkins || 0,
      uniqueUsers: data?.unique_users || 0,
      weekStart: data?.week_start || null,
    })
  } catch (error) {
    console.error('API: Unexpected error fetching weekly stats:', error)
    // Return fallback data instead of error
    return NextResponse.json({
      totalCheckins: 0,
      uniqueUsers: 0,
      weekStart: null,
      error: 'Internal server error'
    })
  }
}
