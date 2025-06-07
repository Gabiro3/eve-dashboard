"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  type: "article_published" | "article_reviewed" | "user_created" | "donation_received"
  title: string
  description: string
  user?: {
    name: string
    avatar?: string
  }
  timestamp: string
  status?: "success" | "pending" | "warning"
}

interface RecentActivityProps {
  activities: Activity[]
  userRole: "admin" | "writer" | "doctor"
}

export function RecentActivity({ activities, userRole }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "article_published":
        return "📝"
      case "article_reviewed":
        return "✅"
      case "user_created":
        return "👤"
      case "donation_received":
        return "💝"
      default:
        return "📋"
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const variants = {
      success: "default",
      pending: "secondary",
      warning: "destructive",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="ml-auto">
        {status}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and actions in your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No recent activity to display</div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {activity.user && (
                      <>
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{activity.user.name}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
