"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, Eye, Edit, Plus, Calendar, BarChart3 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface WriterStats {
  totalArticles: number
  publishedArticles: number
  pendingReview: number
  draftArticles: number
  totalViews: number
  totalLikes: number
  averageReadTime: number
  thisMonthArticles: number
}

interface Article {
  id: string
  title: string
  excerpt: string
  status: "draft" | "pending_review" | "approved" | "rejected"
  created_at: string
  updated_at: string
  read_count: number
  like_count: number
  estimated_read_time: number
  is_featured: boolean
  category: {
    name: string
  }
}

interface WriterDashboardProps {
  user: any
}

export function WriterDashboard({ user }: WriterDashboardProps) {
  const [stats, setStats] = useState<WriterStats>({
    totalArticles: 0,
    publishedArticles: 0,
    pendingReview: 0,
    draftArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    averageReadTime: 0,
    thisMonthArticles: 0,
  })
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadWriterData()
  }, [user])

  const loadWriterData = async () => {
    try {
      setLoading(true)

      // Load writer's articles
      const { data: articles, error } = await supabase
        .from("articles")
        .select(`
          *,
          category:article_categories(name)
        `)
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const articlesData = articles || []

      // Calculate stats
      const totalArticles = articlesData.length
      const publishedArticles = articlesData.filter((a) => a.status === "approved").length
      const pendingReview = articlesData.filter((a) => a.status === "pending_review").length
      const draftArticles = articlesData.filter((a) => a.status === "draft").length
      const totalViews = articlesData.reduce((sum, a) => sum + (a.read_count || 0), 0)
      const totalLikes = articlesData.reduce((sum, a) => sum + (a.like_count || 0), 0)
      const averageReadTime =
        articlesData.length > 0
          ? Math.round(articlesData.reduce((sum, a) => sum + (a.estimated_read_time || 0), 0) / articlesData.length)
          : 0

      // This month articles
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const thisMonthArticles = articlesData.filter((a) => new Date(a.created_at) >= thisMonth).length

      setStats({
        totalArticles,
        publishedArticles,
        pendingReview,
        draftArticles,
        totalViews,
        totalLikes,
        averageReadTime,
        thisMonthArticles,
      })

      // Set recent articles (last 5)
      setRecentArticles(articlesData.slice(0, 5))
    } catch (error: any) {
      console.error("Error loading writer data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: "secondary" as const, label: "Draft", icon: Edit },
      pending_review: { variant: "default" as const, label: "Under Review", icon: Clock },
      approved: { variant: "default" as const, label: "Published", icon: CheckCircle },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: Clock },
    }

    const config = variants[status as keyof typeof variants]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "text-gray-600",
      pending_review: "text-yellow-600",
      approved: "text-green-600",
      rejected: "text-red-600",
    }
    return colors[status as keyof typeof colors] || "text-gray-600"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name.split(" ")[0]}!</h1>
          <p className="text-gray-600 mt-1">Track your writing progress and manage your articles</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">+{stats.thisMonthArticles} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.publishedArticles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalArticles > 0 ? Math.round((stats.publishedArticles / stats.totalArticles) * 100) : 0}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all articles</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Writing Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Read Time</span>
              <span className="font-medium">{stats.averageReadTime} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Likes</span>
              <span className="font-medium">{stats.totalLikes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Draft Articles</span>
              <span className="font-medium">{stats.draftArticles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Engagement Rate</span>
              <span className="font-medium">
                {stats.totalViews > 0 ? ((stats.totalLikes / stats.totalViews) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/posts/create">
                <Plus className="mr-2 h-4 w-4" />
                Write New Article
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/posts?status=draft">
                <Edit className="mr-2 h-4 w-4" />
                Continue Draft
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Writing Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Writing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Use clear, engaging headlines to attract readers</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>Include relevant images to enhance your content</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p>Keep paragraphs short for better readability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>Your latest writing activity</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/posts">View All Articles</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentArticles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600 mb-4">Start writing your first article to see it here</p>
              <Button asChild>
                <Link href="/dashboard/posts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Write Your First Article
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/dashboard/posts/${article.id}`} className="group">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {article.title}
                          </h4>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>

                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Eye className="h-3 w-3 mr-1" />
                            {article.read_count} views
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {article.estimated_read_time} min read
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {article.category.name}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2 ml-4">
                        {getStatusBadge(article.status)}
                        {article.is_featured && (
                          <Badge variant="outline" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
