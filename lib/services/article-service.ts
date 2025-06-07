import { supabaseAdmin } from "@/lib/supabase"
import { createCachedFunction, CACHE_TAGS, CACHE_DURATIONS, invalidateCache } from "@/lib/cache"
import type { Database } from "@/types/database"

type Article = Database["public"]["Tables"]["articles"]["Row"]
type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"]
type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"]

export class ArticleService {
  // Get articles with caching
  static getArticles = createCachedFunction(
    async (
      filters: {
        status?: string
        author_id?: string
        category_id?: string
        limit?: number
        offset?: number
      } = {},
    ) => {
      let query = supabaseAdmin
        .from("articles")
        .select(`
          *,
          author:doctors(name, title, specialization),
          category:article_categories(name, requires_doctor_review)
        `)
        .order("created_at", { ascending: false })

      if (filters.status) {
        query = query.eq("status", filters.status)
      }
      if (filters.author_id) {
        query = query.eq("author_id", filters.author_id)
      }
      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    ["articles"],
    [CACHE_TAGS.ARTICLES],
    CACHE_DURATIONS.MEDIUM,
  )

  static async createArticle(article: ArticleInsert, authorId: string) {
    // Check if category requires doctor review
    let status: "draft" | "pending_review" = "draft"

    if (article.category_id) {
      const { data: category } = await supabaseAdmin
        .from("article_categories")
        .select("requires_doctor_review")
        .eq("id", article.category_id)
        .single()

      if (category?.requires_doctor_review) {
        status = "pending_review"
      }
    }

    const { data, error } = await supabaseAdmin
      .from("articles")
      .insert({
        ...article,
        author_id: authorId,
        status,
        estimated_read_time: this.calculateReadTime(article.content),
      })
      .select()
      .single()

    if (error) throw error

    // Invalidate cache
    await invalidateCache([CACHE_TAGS.ARTICLES])

    return data
  }

  static async updateArticle(id: string, updates: ArticleUpdate, userId: string, userRole: string) {
    // Check permissions
    const { data: article } = await supabaseAdmin.from("articles").select("author_id").eq("id", id).single()

    if (!article) {
      throw new Error("Article not found")
    }

    // Only author or admin can update
    if (article.author_id !== userId && userRole !== "admin") {
      throw new Error("Unauthorized")
    }

    const { data, error } = await supabaseAdmin
      .from("articles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await invalidateCache([CACHE_TAGS.ARTICLES])
    return data
  }

  static async reviewArticle(id: string, status: "approved" | "rejected", reviewNotes: string, reviewerId: string) {
    const { data, error } = await supabaseAdmin
      .from("articles")
      .update({
        status,
        review_notes: reviewNotes,
        reviewed_by: reviewerId,
        is_published: status === "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await invalidateCache([CACHE_TAGS.ARTICLES])
    return data
  }

  static async deleteArticle(id: string, userId: string, userRole: string) {
    // Check permissions
    const { data: article } = await supabaseAdmin.from("articles").select("author_id").eq("id", id).single()

    if (!article) {
      throw new Error("Article not found")
    }

    if (article.author_id !== userId && userRole !== "admin") {
      throw new Error("Unauthorized")
    }

    const { error } = await supabaseAdmin.from("articles").delete().eq("id", id)

    if (error) throw error

    await invalidateCache([CACHE_TAGS.ARTICLES])
  }

  private static calculateReadTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  // Get pending reviews for doctors
  static getPendingReviews = createCachedFunction(
    async () => {
      const { data, error } = await supabaseAdmin
        .from("articles")
        .select(`
          *,
          author:doctors(name, title),
          category:article_categories(name)
        `)
        .eq("status", "pending_review")
        .order("created_at", { ascending: true })

      if (error) throw error
      return data
    },
    ["pending-reviews"],
    [CACHE_TAGS.ARTICLES],
    CACHE_DURATIONS.SHORT,
  )
}
