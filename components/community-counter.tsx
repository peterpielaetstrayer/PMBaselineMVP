"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface WeeklyStats {
  totalCheckins: number
  uniqueUsers: number
  weekStart: string | null
}

export function CommunityCounter() {
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        console.log('CommunityCounter: Fetching stats...')
        
        const response = await fetch('/api/stats/weekly')
        console.log('CommunityCounter: Response status:', response.status)
        
        const data = await response.json()
        console.log('CommunityCounter: Response data:', data)
        
        setStats(data)
        setError(null)
      } catch (err) {
        console.error('CommunityCounter: Error fetching community stats:', err)
        setError('Unable to load community stats')
        // Set fallback data to show something
        setStats({
          totalCheckins: 0,
          uniqueUsers: 0,
          weekStart: null
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-to-r from-ocean-light/10 to-ocean-deep/10 border-ocean-light/20">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-ocean-light/20 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-ocean-light/10 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4 bg-gradient-to-r from-ocean-light/10 to-ocean-deep/10 border-ocean-light/20">
        <div className="text-center text-navy-text/60">
          <p className="text-sm">Community stats temporarily unavailable</p>
        </div>
      </Card>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-ocean-light/10 to-ocean-deep/10 border-ocean-light/20">
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <span className="text-2xl mr-2">🌊</span>
          <span className="text-2xl font-bold text-ocean-deep">
            {formatNumber(stats?.totalCheckins || 0)}
          </span>
        </div>
        <p className="text-sm text-navy-text/80 font-medium">
          baseline check-ins logged by the community this week
        </p>
        {stats?.uniqueUsers && stats.uniqueUsers > 0 && (
          <p className="text-xs text-navy-text/60 mt-1">
            from {stats.uniqueUsers} {stats.uniqueUsers === 1 ? 'person' : 'people'}
          </p>
        )}
      </div>
    </Card>
  )
}
