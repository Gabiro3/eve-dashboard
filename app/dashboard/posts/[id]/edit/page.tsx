"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Eye, X, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface PostFormData {
  title: string
  content: string
  excerpt: string
  featured_image_url: string
  category_id: string
  is_featured: boolean
  tags: string[]
  status: "draft" | "pending_review" | "approved"
}

interface Category {
  id: string
  name: string
}

export default function EditPostPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    excerpt: "",
    featured_image_url: "",
    category_id: "",
    is_featured: false,
    tags: [],
    status: "draft",
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { id } = useParams() as { id: string }
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [originalPost, setOriginalPost] = useState<any>(null)
  const checkUser = async () => {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser()
    
          if (!authUser) {
            router.push("/login")
            return
          }
  
          const { data: profile, error } = await supabase
            .from("admin_users")
            .select(`
              *`)
            .eq("id", authUser.id)
            .single()
    
          if (profile) {
            setUser(profile)
          }
        } catch (error) {
          console.error("Error checking user:", error)
          router.push("/login")
        } finally {
          setLoading(false)
        }
      }

  useEffect(() => {
    checkUser()
    loadCategories()
    loadPost(id)
  }, [params.id])

  const loadPost = async (postId: string) => {
    try {
      const { data, error } = await supabase.from("articles").select("*").eq("id", postId).single()

      if (error) throw error

      if (!data) {
        toast({
          title: "Error",
          description: "Post not found",
          variant: "destructive",
        })
        router.push("/dashboard/posts")
        return
      }

      setOriginalPost(data)
      console.log("Loaded post data:", data)
      setFormData({
        title: data.title || "",
        content: data.content || "",
        excerpt: data.excerpt || "",
        featured_image_url: data.featured_image_url || "",
        category_id: data.category_id || "",
        is_featured: data.is_featured || false,
        tags: data.tags || [],
        status: data.status || "draft",
      })
    } catch (error: any) {
      console.error("Error loading post:", error)
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("article_categories").select("id, name").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `articles/${fileName}`

      const { error: uploadError } = await supabase.storage.from("articles").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("articles").getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, featured_image_url: publicUrl }))

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Title is required")
      }
      if (!formData.content.trim()) {
        throw new Error("Content is required")
      }
      if (!formData.category_id) {
        throw new Error("Category is required")
      }

      // Calculate estimated read time
      const wordCount = formData.content.split(/\s+/).length
      const estimatedReadTime = Math.ceil(wordCount / 200)

      // Generate excerpt if not provided
      const excerpt = formData.excerpt.trim() || formData.content.replace(/<[^>]*>/g, "").substring(0, 200) + "..."

      const updateData = {
        title: formData.title.trim(),
        content: formData.content,
        excerpt,
        cover_image: formData.featured_image_url || null,
        category_id: formData.category_id,
        is_featured: formData.is_featured,
        tags: formData.tags,
        estimated_read_time: estimatedReadTime,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("articles").update(updateData).eq("id", params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Post updated successfully",
      })

      router.push(`/dashboard/posts/${params.id}`)
    } catch (error: any) {
      console.error("Error updating post:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar userRole={user?.role || "writer"} />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar userRole={user?.role || "writer"} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">Edit Post</h1>
                    <p className="text-gray-600">Make changes to your blog post</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/posts/${params.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Link>
                  </Button>
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Main Content */}
                  <div className="md:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Post Content</CardTitle>
                        <CardDescription>The main content of your blog post</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder={originalPost.title || "Enter post title"}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="excerpt">Excerpt</Label>
                          <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                            placeholder="Brief description of the post (optional - will be auto-generated if empty)"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="content">Content *</Label>
                          <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                            placeholder="Write your post content here..."
                            rows={15}
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Featured Image */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Featured Image</CardTitle>
                        <CardDescription>Upload an image to represent your post</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {formData.featured_image_url && (
                            <div className="relative">
                              <img
                                src={formData.featured_image_url || "/placeholder.svg"}
                                alt="Featured image"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setFormData((prev) => ({ ...prev, featured_image_url: "" }))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          <div>
                            <Label htmlFor="image-upload">Upload Image</Label>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                            {uploading && (
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading image...
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Post Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category_id}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {(user?.role === "admin" || originalPost?.status === "draft") && (
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value: "draft" | "pending_review" | "approved") =>
                                setFormData((prev) => ({ ...prev, status: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending_review">Submit for Review</SelectItem>
                                {user?.role === "admin" && <SelectItem value="approved">Publish</SelectItem>}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="featured"
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))}
                          />
                          <Label htmlFor="featured">Featured Post</Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Tags</CardTitle>
                        <CardDescription>Add tags to help categorize your post</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add a tag"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          />
                          <Button type="button" onClick={addTag} size="sm">
                            Add
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
