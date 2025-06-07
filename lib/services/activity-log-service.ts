import { getSupabaseClient } from "@/lib/supabase-client"
import type { UserActivityLog } from "@/lib/auth/types"

// Log user activity
export async function logUserActivity(activity: {
  user_id: string
  pharmacy_id: string
  action: string
  resource_type: string
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
}): Promise<void> {
  const supabase = getSupabaseClient()

  try {
    await supabase.from("user_activity_logs").insert({
      user_id: activity.user_id,
      pharmacy_id: activity.pharmacy_id,
      action: activity.action,
      resource_type: activity.resource_type,
      resource_id: activity.resource_id || null,
      details: activity.details || null,
      ip_address: activity.ip_address || null,
      user_agent: activity.user_agent || null,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error logging user activity:", error)
  }
}

// Get user activity logs
export async function getUserActivityLogs(options: {
  pharmacy_id: string
  user_id?: string
  action?: string
  resource_type?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}): Promise<{ data: UserActivityLog[]; count: number }> {
  const supabase = getSupabaseClient()
  const { pharmacy_id, user_id, action, resource_type, start_date, end_date, limit = 50, offset = 0 } = options

  try {
    let query = supabase
      .from("user_activity_logs")
      .select(
        `
        *,
        users(id, full_name, email)
      `,
        { count: "exact" },
      )
      .eq("pharmacy_id", pharmacy_id)
      .order("created_at", { ascending: false })

    if (user_id) {
      query = query.eq("user_id", user_id)
    }

    if (action) {
      query = query.eq("action", action)
    }

    if (resource_type) {
      query = query.eq("resource_type", resource_type)
    }

    if (start_date) {
      query = query.gte("created_at", start_date)
    }

    if (end_date) {
      query = query.lte("created_at", end_date)
    }

    query = query.limit(limit).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching activity logs:", error)
      return { data: [], count: 0 }
    }

    return { data: data as UserActivityLog[], count: count || 0 }
  } catch (error) {
    console.error("Error in getUserActivityLogs:", error)
    return { data: [], count: 0 }
  }
}

// Get activity summary
export async function getActivitySummary(
  pharmacy_id: string,
  days = 30,
): Promise<{
  totalActions: number
  uniqueUsers: number
  topActions: Array<{ action: string; count: number }>
  dailyActivity: Array<{ date: string; count: number }>
}> {
  const supabase = getSupabaseClient()

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from("user_activity_logs")
      .select("action, user_id, created_at")
      .eq("pharmacy_id", pharmacy_id)
      .gte("created_at", startDate.toISOString())

    if (error) {
      console.error("Error fetching activity summary:", error)
      return { totalActions: 0, uniqueUsers: 0, topActions: [], dailyActivity: [] }
    }

    const totalActions = data.length
    const uniqueUsers = new Set(data.map((log) => log.user_id)).size

    // Count actions
    const actionCounts: Record<string, number> = {}
    data.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
    })

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Daily activity
    const dailyCounts: Record<string, number> = {}
    data.forEach((log) => {
      const date = new Date(log.created_at).toISOString().split("T")[0]
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })

    const dailyActivity = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { totalActions, uniqueUsers, topActions, dailyActivity }
  } catch (error) {
    console.error("Error in getActivitySummary:", error)
    return { totalActions: 0, uniqueUsers: 0, topActions: [], dailyActivity: [] }
  }
}
