"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, Clock, User, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Post {
  id: string
  title: string
  excerpt: string
  status: "draft" | "pending_review" | "approved" | "rejected"
  author: {
    name: string
    title?: string
    profile_image_url?: string
  }
  category: {
    name: string
  }
  created_at: string
  read_count: number
  estimated_read_time: number
  is_featured: boolean
}

interface RecentPostsProps {
  posts: Post[]
  userRole: "admin" | "writer" | "doctor"
}

export function RecentPosts({ posts, userRole }: RecentPostsProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: "secondary" as const, label: "Draft" },
      pending_review: { variant: "default" as const, label: "Pending" },
      approved: { variant: "default" as const, label: "Published" },
      rejected: { variant: "destructive" as const, label: "Rejected" },
    }

    const config = variants[status as keyof typeof variants]
    if (!config) return null

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Blogs</CardTitle>
            <CardDescription>Latest articles</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/posts">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📝</div>
              <p>No recent posts to display</p>
              {(userRole === "admin" || userRole === "writer") && (
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/dashboard/posts/new">Create First Post</Link>
                </Button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/dashboard/posts/${post.id}`} className="group">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {post.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>

                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          {post.author.name}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 whitespace-nowrap">
  <Clock className="h-3 w-3 mr-1" />
  <span>{post.estimated_read_time} min read</span>
</div>

                        <div className="flex items-center text-xs text-gray-500">
                          <Eye className="h-3 w-3 mr-1" />
                          {post.read_count}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1 ml-2">
                      {getStatusBadge(post.status)}
                      {post.is_featured && (
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category.name}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
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
