"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users } from "lucide-react"
import { useMemo } from "react"

interface UserRegistrationData {
  date: string
  count: number
}

interface UserRegistrationChartProps {
  data: UserRegistrationData[]
  title?: string
  description?: string
  period?: "7d" | "30d" | "90d"
}

export function UserRegistrationChart({
  data,
  title = "User Registrations",
  description = "New user registrations over time",
  period = "30d",
}: UserRegistrationChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], values: [], total: 0, trend: 0 }

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const labels = sortedData.map((item) => {
      const date = new Date(item.date)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    })

    const values = sortedData.map((item) => item.count)
    const total = values.reduce((sum, val) => sum + val, 0)

    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(values.length / 2)
    const firstHalf = values.slice(0, midPoint).reduce((sum, val) => sum + val, 0)
    const secondHalf = values.slice(midPoint).reduce((sum, val) => sum + val, 0)
    const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0

    return { labels, values, total, trend }
  }, [data])

  const maxValue = Math.max(...chartData.values, 1)
  const chartHeight = 200

  const getPeriodLabel = () => {
    switch (period) {
      case "7d":
        return "Last 7 days"
      case "30d":
        return "Last 30 days"
      case "90d":
        return "Last 90 days"
      default:
        return "Recent period"
    }
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>
            {description} • {getPeriodLabel()}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {chartData.total} total
          </Badge>
          <Badge variant={chartData.trend >= 0 ? "default" : "destructive"} className="flex items-center gap-1">
            {chartData.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(chartData.trend).toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Period Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{chartData.total}</div>
              <p className="text-xs text-muted-foreground">Total Registrations</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {chartData.values.length > 0 ? Math.round(chartData.total / chartData.values.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Daily Average</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Math.max(...chartData.values)}</div>
              <p className="text-xs text-muted-foreground">Peak Day</p>
            </div>
          </div>

          {/* Chart */}
          <div className="relative" style={{ height: chartHeight }}>
            {chartData.values.length > 0 ? (
              <div className="absolute inset-0 flex items-end justify-between space-x-1">
                {chartData.values.map((value, index) => {
                  const height = (value / maxValue) * chartHeight
                  const isHighest = value === Math.max(...chartData.values)
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full rounded-t-sm transition-all hover:opacity-80 ${
                          isHighest
                            ? "bg-gradient-to-t from-blue-600 to-blue-400"
                            : "bg-gradient-to-t from-blue-500 to-blue-300"
                        }`}
                        style={{ height: `${height}px` }}
                        title={`${chartData.labels[index]}: ${value} registrations`}
                      />
                      {value > 0 && <span className="text-xs text-gray-600 mt-1 font-medium">{value}</span>}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No registration data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Labels */}
          {chartData.labels.length > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              {chartData.labels.map((label, index) => (
                <span key={index} className={index % 2 === 0 ? "" : "opacity-60"}>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
