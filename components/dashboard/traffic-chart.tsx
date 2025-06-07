"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface TrafficChartProps {
  data: {
    labels: string[]
    values: number[]
    currentValue: number
    trend: number
  }
  title?: string
  description?: string
}

export function TrafficChart({
  data,
  title = "Traffic Stats",
  description = "Page views over time",
}: TrafficChartProps) {
  const maxValue = Math.max(...data.values)
  const chartHeight = 200

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge variant="secondary" className="ml-auto">
          <TrendingUp className="mr-1 h-3 w-3" />+{data.trend}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Value Display */}
          <div>
            <div className="text-3xl font-bold">{data.currentValue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Current month views</p>
          </div>

          {/* Simple Chart */}
          <div className="relative" style={{ height: chartHeight }}>
            <div className="absolute inset-0 flex items-end justify-between space-x-1">
              {data.values.map((value, index) => {
                const height = (value / maxValue) * chartHeight
                return (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-t-sm flex-1 transition-all hover:bg-blue-600"
                    style={{ height: `${height}px` }}
                    title={`${data.labels[index]}: ${value}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            {data.labels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
