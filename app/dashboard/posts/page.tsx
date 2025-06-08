"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { PostList } from "@/components/posts/post-list"
import { supabase } from "@/lib/supabase"
import { Post } from "@/components/posts/post-list"


export default function PostsPage() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase.from("admin_users").select("*").eq("id", authUser.id).single()

      if (profile) {
        setUser(profile)
        await loadPosts(profile)
      }
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadPosts = async (userProfile: any) => {
    try {
      let query = supabase.from("articles").select(`
          *,
          author:admin_users(name, role, profile_image_url),
          category:article_categories(name)
        `)

      // Filter based on user role
      if (userProfile.role === "writer") {
        query = query.eq("author_id", userProfile.id)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error loading posts:", error)
    }
  }

  const handleEditPost = (post: any) => {
    router.push(`/dashboard/posts/${post.id}/edit`)
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase.from("articles").delete().eq("id", postId)

      if (error) throw error

      // Reload posts
      await loadPosts(user)
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const handleReviewPost = async (postId: string, status: "approved" | "rejected", notes: string) => {
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
        .eq("id", postId)

      if (error) throw error

      // Reload posts
      await loadPosts(user)
    } catch (error) {
      console.error("Error reviewing post:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userRole={user.role} />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <PostList
              posts={posts}
              userRole={user.role}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onReview={handleReviewPost}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
