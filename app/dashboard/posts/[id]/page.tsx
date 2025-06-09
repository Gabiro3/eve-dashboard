"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Eye,
  Clock,
  Calendar,
  Tag,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  status: "draft" | "pending_review" | "approved" | "rejected";
  author: {
    id: string;
    name: string;
    title: string;
    profile_image_url?: string;
  };
  category: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  read_count: number;
  like_count: number;
  comment_count: number;
  estimated_read_time: number;
  is_featured: boolean;
  tags: string[];
}

export default function PostViewPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("admin_users")
        .select(
          `
            *`
        )
        .eq("id", authUser.id)
        .single();

      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    if (params.id) {
      loadPost(params.id as string);
    }
  }, [params.id]);

  const loadPost = async (postId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select(
          `
          *,
          author:admin_users(id, name, role, profile_image_url),
          category:article_categories(id, name)
        `
        )
        .eq("id", postId)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Post not found");
        return;
      }

      setPost(data as Post);

      // Increment view count
      await supabase
        .from("articles")
        .update({ read_count: (data.read_count || 0) + 1 })
        .eq("id", postId);
    } catch (error: any) {
      console.error("Error loading post:", error);
      setError(error.message || "Failed to load post");
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: {
        variant: "secondary" as const,
        label: "Draft",
        color: "bg-gray-100 text-gray-800",
      },
      pending_review: {
        variant: "default" as const,
        label: "Pending Review",
        color: "bg-yellow-100 text-yellow-800",
      },
      approved: {
        variant: "default" as const,
        label: "Published",
        color: "bg-green-100 text-green-800",
      },
      rejected: {
        variant: "destructive" as const,
        label: "Rejected",
        color: "bg-red-100 text-red-800",
      },
    };

    const config = variants[status as keyof typeof variants];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const canEdit = () => {
    if (!user || !post) return false;
    if (user.role === "admin") return true;
    if (user.role === "writer" && post.author.id === user.doctor_id)
      return true;
    return false;
  };

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
    );
  }

  if (error || !post) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar userRole={user?.role || "writer"} />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">📄</div>
                    <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
                    <p className="text-gray-600 mb-4">
                      {error || "The post you're looking for doesn't exist."}
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/posts">Back to Posts</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </>
    );
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
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                {canEdit() && (
                  <Button asChild>
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Post
                    </Link>
                  </Button>
                )}
              </div>

              {/* Post Content */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusBadge(post.status)}
                        {post.is_featured && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline">{post.category.name}</Badge>
                      </div>
                      <CardTitle className="text-3xl mb-2">
                        {post.title}
                      </CardTitle>
                      {post.cover_image && (
                        <div className="mb-4">
                          <Image
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-64 object-cover rounded-lg"
                            width={640}
                            height={256}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Author and Meta Info */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            post.author.profile_image_url || "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {getInitials(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.author.name}</p>
                        <p className="text-sm text-gray-600">
                          {post.author.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.estimated_read_time} min read
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.read_count} views
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Content */}
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Tags:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="my-6" />

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Heart className="h-5 w-5" />
                        <span>{post.like_count} likes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comment_count} comments</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Eye className="h-5 w-5" />
                        <span>{post.read_count} views</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Comments ({post.comment_count})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Comments feature coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
