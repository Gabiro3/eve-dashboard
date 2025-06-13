"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserCheck, Clock, CheckCircle, XCircle, Eye, Calendar, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface ReviewArticle {
  id: string
  title: string
  excerpt: string
  content: string
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

export default function ReviewsPage() {
  const [user, setUser] = useState<any>(null)
  const [pendingArticles, setPendingArticles] = useState<ReviewArticle[]>([])
  const [reviewedArticles, setReviewedArticles] = useState<ReviewArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<ReviewArticle | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved")
  const { toast } = useToast()
  

  
  useEffect(() => {
  const fetchUser = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      console.error("Error fetching user:", error)
      toast({
        title: "Error",
        description: "Unable to retrieve user info.",
        variant: "destructive",
      })
      return
    }
    const { data: profile } = await supabase.from("admin_users").select("*").eq("id", data.user.id).single()

      if (profile) {
        setUser(profile)
      }
  }

  fetchUser()
}, [])

  useEffect(() => {
  if (user) {
    loadArticles()
  }
}, [user])


  const loadArticles = async () => {
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

      // Load reviewed articles by this doctor
      const { data: reviewedData, error: reviewedError } = await supabase
        .from("articles")
        .select(`
          *,
          author:admin_users(name, role),
          category:article_categories(name)
        `)
        .eq("reviewed_by", user?.id)
        .in("status", ["approved", "rejected"])
        .order("updated_at", { ascending: false })

      if (reviewedError) throw reviewedError

      setPendingArticles(pendingData || [])
      setReviewedArticles(reviewedData || [])
    } catch (error: any) {
      console.error("Error loading articles:", error)
      toast({
        title: "Error",
        description: "Failed to load articles for review",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedArticle) return

    try {
      const { error } = await supabase
        .from("articles")
        .update({
          status: reviewStatus,
          review_notes: reviewNotes,
          reviewed_by: user?.id,
          is_published: reviewStatus === "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedArticle.id)

      if (error) throw error

      toast({
        title: "Review Submitted",
        description: `Article has been ${reviewStatus}`,
      })

      setReviewDialogOpen(false)
      setSelectedArticle(null)
      setReviewNotes("")
      await loadArticles()
    } catch (error: any) {
      console.error("Error reviewing article:", error)
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      })
    }
  }

  const openReviewDialog = (article: ReviewArticle, status: "approved" | "rejected") => {
    setSelectedArticle(article)
    setReviewStatus(status)
    setReviewNotes("")
    setReviewDialogOpen(true)
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

  const filteredPendingArticles = pendingArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredReviewedArticles = reviewedArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-medium">Loading reviews...</div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user!}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Article Reviews</h1>
              <p className="text-gray-600 mt-1">Review articles for medical accuracy and compliance</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {pendingArticles.length} Pending
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {reviewedArticles.length} Reviewed
              </Badge>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Reviews ({filteredPendingArticles.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed Reviews ({filteredReviewedArticles.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Reviews */}
            <TabsContent value="pending">
              {filteredPendingArticles.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                    <p className="text-gray-600">
                      {searchQuery ? "No articles match your search." : "No articles pending review at the moment."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredPendingArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">{article.excerpt}</CardDescription>
                          </div>
                          <div className="ml-4">{getStatusBadge(article.status)}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {article.estimated_read_time} min read
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {article.category.name}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/dashboard/posts/${article.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                Review
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openReviewDialog(article, "approved")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openReviewDialog(article, "rejected")}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600">
                            <strong>Author:</strong> {article.author.name} • {article.author.title}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Completed Reviews */}
            <TabsContent value="completed">
              {filteredReviewedArticles.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <UserCheck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? "No reviewed articles match your search."
                        : "Articles you review will appear here."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredReviewedArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">{article.excerpt}</CardDescription>
                          </div>
                          <div className="ml-4">{getStatusBadge(article.status)}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Reviewed {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {article.category.name}
                            </Badge>
                          </div>

                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/posts/${article.id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>

                        <div className="mt-4 pt-4 border-t space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>Author:</strong> {article.author.name} • {article.author.title}
                          </p>
                          {article.review_notes && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Review Notes:</strong> {article.review_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Review Dialog */}
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{reviewStatus === "approved" ? "Approve Article" : "Reject Article"}</DialogTitle>
                <DialogDescription>
                  {reviewStatus === "approved"
                    ? "This article will be published and made available to users."
                    : "This article will be rejected and returned to the author for revision."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedArticle && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium">{selectedArticle.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">By {selectedArticle.author.name}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="review-notes" className="text-sm font-medium">
                    Review Notes {reviewStatus === "rejected" ? "*" : "(Optional)"}
                  </label>
                  <Textarea
                    id="review-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={
                      reviewStatus === "approved"
                        ? "Add any comments or suggestions for the author..."
                        : "Please explain why this article is being rejected..."
                    }
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReview}
                  variant={reviewStatus === "approved" ? "default" : "destructive"}
                  disabled={reviewStatus === "rejected" && !reviewNotes.trim()}
                >
                  {reviewStatus === "approved" ? "Approve Article" : "Reject Article"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
      </DashboardLayout>
  )
}
