"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Calendar,
  AlertCircle,
  TrendingUp,
  Users,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface DoctorStats {
  pendingReviews: number
  reviewedThisMonth: number
  totalReviewed: number
  approvedArticles: number
  rejectedArticles: number
  myArticles: number
  averageReviewTime: number
  pendingAppointments: number
}

interface ReviewArticle {
  id: string
  title: string
  excerpt: string
  status: "pending_review" | "approved" | "rejected"
  created_at: string
  updated_at: string
  reviewed_by: string | null
  review_notes: string | null
  author: {
    name: string
    title: string
  }
  category: {
    name: string
  }
  estimated_read_time: number
}

    interface DoctorDashboardProps {
    user: any
    }

export function DoctorDashboard({ user }: DoctorDashboardProps) {
  const [stats, setStats] = useState<DoctorStats>({
    pendingReviews: 0,
    reviewedThisMonth: 0,
    totalReviewed: 0,
    approvedArticles: 0,
    rejectedArticles: 0,
    myArticles: 0,
    averageReviewTime: 0,
    pendingAppointments: 0,
  })
  const [pendingArticles, setPendingArticles] = useState<ReviewArticle[]>([])
  const [recentReviews, setRecentReviews] = useState<ReviewArticle[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadDoctorData()
  }, [user])

  const loadDoctorData = async () => {
    try {
      setLoading(true)

      // Load pending reviews
      const { data: pendingData, error: pendingError } = await supabase
        .from("articles")
        .select(`
          *,
          author:admin_users(name, role),
          category:article_categories(name)
        `)
        .eq("status", "pending_review")
        .order("created_at", { ascending: true })

      if (pendingError) throw pendingError

      // Load articles reviewed by this doctor
      const { data: reviewedData, error: reviewedError } = await supabase
        .from("articles")
        .select(`
          *,
          author:admin_users(name, role),
          category:article_categories(name)
        `)
        .eq("reviewed_by", user.id)
        .order("updated_at", { ascending: false })

      if (reviewedError) throw reviewedError

      // Load doctor's own articles
      const { data: myArticlesData, error: myArticlesError } = await supabase
        .from("articles")
        .select("*")
        .eq("author_id", user.id)

      if (myArticlesError) throw myArticlesError

      const pendingArticlesData = pendingData || []
      const reviewedArticlesData = reviewedData || []
      const myArticlesData_clean = myArticlesData || []

      // Calculate stats
      const pendingReviews = pendingArticlesData.length
      const totalReviewed = reviewedArticlesData.length
      const approvedArticles = reviewedArticlesData.filter((a) => a.status === "approved").length
      const rejectedArticles = reviewedArticlesData.filter((a) => a.status === "rejected").length
      const myArticles = myArticlesData_clean.length

      // This month reviews
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const reviewedThisMonth = reviewedArticlesData.filter((a) => new Date(a.updated_at) >= thisMonth).length

      // Mock data for appointments and average review time
      const pendingAppointments = 12
      const averageReviewTime = 2.5

      setStats({
        pendingReviews,
        reviewedThisMonth,
        totalReviewed,
        approvedArticles,
        rejectedArticles,
        myArticles,
        averageReviewTime,
        pendingAppointments,
      })

      // Set pending articles (first 5)
      setPendingArticles(pendingArticlesData.slice(0, 5))

      // Set recent reviews (first 5)
      setRecentReviews(reviewedArticlesData.slice(0, 5))
    } catch (error: any) {
      console.error("Error loading doctor data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickReview = async (articleId: string, status: "approved" | "rejected", notes = "") => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({
          status,
          review_notes: notes,
          reviewed_by: user.id,
          is_published: status === "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", articleId)

      if (error) throw error

      toast({
        title: "Review Submitted",
        description: `Article has been ${status}`,
      })

      // Reload data
      loadDoctorData()
    } catch (error: any) {
      console.error("Error reviewing article:", error)
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending_review: { variant: "default" as const, label: "Pending Review", icon: Clock },
      approved: { variant: "default" as const, label: "Approved", icon: CheckCircle },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: XCircle },
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
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Dr. {user.name.split(" ")[0]}!</h1>
          <p className="text-gray-600 mt-1">Review articles and manage your medical content</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/reviews">
            <UserCheck className="mr-2 h-4 w-4" />
            Review Articles
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.reviewedThisMonth}</div>
            <p className="text-xs text-muted-foreground">+{stats.approvedArticles} approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviewed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalReviewed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviewed > 0 ? Math.round((stats.approvedArticles / stats.totalReviewed) * 100) : 0}% approval
              rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Articles</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.myArticles}</div>
            <p className="text-xs text-muted-foreground">Articles authored</p>
          </CardContent>
        </Card>
      </div>

      {/* Review Performance */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approved Articles</span>
              <span className="font-medium text-green-600">{stats.approvedArticles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rejected Articles</span>
              <span className="font-medium text-red-600">{stats.rejectedArticles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Review Time</span>
              <span className="font-medium">{stats.averageReviewTime} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approval Rate</span>
              <span className="font-medium">
                {stats.totalReviewed > 0 ? Math.round((stats.approvedArticles / stats.totalReviewed) * 100) : 0}%
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
              <Link href="/dashboard/reviews">
                <UserCheck className="mr-2 h-4 w-4" />
                Review Articles ({stats.pendingReviews})
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/appointments">
                <Users className="mr-2 h-4 w-4" />
                Appointments ({stats.pendingAppointments})
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/posts">
                <FileText className="mr-2 h-4 w-4" />
                My Articles
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Review Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Verify medical accuracy and evidence-based content</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>Check for appropriate language and tone</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p>Ensure compliance with medical guidelines</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Articles Awaiting Review</CardTitle>
                <CardDescription>Articles that need your medical review</CardDescription>
              </div>
              <Badge variant="secondary">{stats.pendingReviews}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {pendingArticles.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No articles pending review at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingArticles.map((article) => (
                  <div key={article.id} className="p-4 rounded-lg border hover:bg-gray-50 transition-colors">
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
                            <Clock className="h-3 w-3 mr-1" />
                            {article.estimated_read_time} min read
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {article.category.name}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          By {article.author.name} • {article.author.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleQuickReview(article.id, "approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleQuickReview(article.id, "rejected", "Requires revision")}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/posts/${article.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}

                {stats.pendingReviews > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/reviews">View All {stats.pendingReviews} Pending Reviews</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recently Reviewed</CardTitle>
                <CardDescription>Articles you've recently reviewed</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/reviews?tab=completed">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">Your reviewed articles will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((article) => (
                  <div key={article.id} className="p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/dashboard/posts/${article.id}`} className="group">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {article.title}
                          </h4>
                        </Link>

                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            Reviewed {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {article.category.name}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">By {article.author.name}</p>

                        {article.review_notes && (
                          <p className="text-xs text-gray-600 mt-2 italic">"{article.review_notes}"</p>
                        )}
                      </div>

                      <div className="ml-4">{getStatusBadge(article.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
