"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, FileText, Heart, Eye } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon: React.ReactNode
}

function StatsCard({ title, value, description, trend, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{description}</span>
          {trend && (
            <Badge variant={trend.isPositive ? "default" : "destructive"} className="ml-auto">
              {trend.isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
              {Math.abs(trend.value)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface OverviewStatsProps {
  userRole: "admin" | "writer" | "doctor"
  stats: {
    totalUsers?: number
    totalArticles?: number
    totalDonations?: number
    totalViews?: number
    myArticles?: number
    pendingReviews?: number
    publishedArticles?: number
    pendingAppointments?: number
  }
}

export function OverviewStats({ userRole, stats }: OverviewStatsProps) {
  const getStatsForRole = () => {
    switch (userRole) {
      case "admin":
        return [
          {
            title: "Total Users",
            value: stats.totalUsers || 0,
            description: "Active platform users",
            trend: { value: 12, isPositive: true },
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
          },
          {
            title: "Published Articles",
            value: stats.totalArticles || 0,
            description: "Total published content",
            trend: { value: 8, isPositive: true },
            icon: <FileText className="h-4 w-4 text-muted-foreground" />,
          },
          {
            title: "Total Donations",
            value: `$${(stats.totalDonations || 0).toLocaleString()}`,
            description: "Funds raised this month",
            trend: { value: 15, isPositive: true },
            icon: <Heart className="h-4 w-4 text-muted-foreground" />,
          },
          {
            title: "Page Views",
            value: (stats.totalViews || 0).toLocaleString(),
            description: "Total page views",
            trend: { value: 5, isPositive: true },
            icon: <Eye className="h-4 w-4 text-muted-foreground" />,
          },
        ]

      case "writer":
        return [
          {
            title: "My Articles",
            value: stats.myArticles || 0,
            description: "Total articles written",
            icon: <FileText className="h-4 w-4 text-muted-foreground" />,
          },
          {
            title: "Pending Review",
            value: stats.pendingReviews || 0,
            description: "Articles awaiting approval",
            icon: <Eye className="h-4 w-4 text-muted-foreground" />,
          },
          {
            title: "Published",
            value: stats.publishedArticles || 0,
            description: "Live articles",
            trend: { value: 10, isPositive: true },
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
          },
          {
            title: "Total Views",
            value: (stats.totalViews || 0).toLocaleString(),
            description: "Views on your articles",
            trend: { value: 25, isPositive: true },
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
          },
        ]

      case "doctor":
        return [
          {
            title: "Pending Reviews",
            value: stats.pendingReviews || 0,
            description: "Articles to review",
            icon: <FileText className="h-4 w-4 text-muted-foreground" />,
          },
          {
            title: "Appointments",
            value: stats.pendingAppointments || 0,
            description: "Pending appointments",
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
          },
          {
            title: "My Articles",
            value: stats.myArticles || 0,
            description: "Articles authored",
            icon: <Eye className="h-4 w-4 text-muted-foreground" />,
          },
          {
            title: "Reviews Completed",
            value: stats.publishedArticles || 0,
            description: "Articles reviewed",
            trend: { value: 8, isPositive: true },
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
          },
        ]

      default:
        return []
    }
  }

  const statsCards = getStatsForRole()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}
