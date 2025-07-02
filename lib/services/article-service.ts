import {
  createCachedFunction,
  CACHE_TAGS,
  CACHE_DURATIONS,
  invalidateCache,
} from "@/lib/cache";
import type { Database } from "@/types/database";
import { getSupabaseClient } from "@/lib/supabase-client";

type Article = Database["public"]["Tables"]["articles"]["Row"];
type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"];
type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"];
const supabase = getSupabaseClient();

export class ArticleService {
  // Get articles with caching
  static getArticles = createCachedFunction(
    async (
      filters: {
        status?: string;
        author_id?: string;
        category_id?: string;
        limit?: number;
        offset?: number;
      } = {}
    ) => {
      let query = supabase
        .from("articles")
        .select(
          `
          *,
          author:admin_users(name, role),
          category:article_categories(name, requires_doctor_review)
        `
        )
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.author_id) {
        query = query.eq("author_id", filters.author_id);
      }
      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    ["articles"],
    [CACHE_TAGS.ARTICLES],
    CACHE_DURATIONS.MEDIUM
  );

  static async createArticle(article: ArticleInsert, authorId: string) {
    // Check if category requires doctor review
    let status: "draft" | "pending_review" = "draft";

    if (article.category_id) {
      const { data: category } = await supabase
        .from("article_categories")
        .select("requires_doctor_review")
        .eq("id", article.category_id)
        .single();

      if (category?.requires_doctor_review) {
        status = "pending_review";
      }
    }

    const { data, error } = await supabase
      .from("articles")
      .insert({
        ...article,
        author_id: authorId,
        status,
        estimated_read_time: this.calculateReadTime(article.content),
      })
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    await invalidateCache([CACHE_TAGS.ARTICLES]);

    return data;
  }

  static async updateArticle(
    id: string,
    updates: ArticleUpdate,
    userId: string,
    userRole: string
  ) {
    // Check permissions
    const { data: article } = await supabase
      .from("articles")
      .select("author_id")
      .eq("id", id)
      .single();

    if (!article) {
      throw new Error("Article not found");
    }

    // Only author or admin can update
    if (article.author_id !== userId && userRole !== "admin") {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("articles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await invalidateCache([CACHE_TAGS.ARTICLES]);
    return data;
  }

  static async reviewArticle(
    id: string,
    status: "approved" | "rejected",
    reviewNotes: string,
    reviewerId: string
  ) {
    const { data, error } = await supabase
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
      .single();

    if (error) throw error;

    await invalidateCache([CACHE_TAGS.ARTICLES]);
    return data;
  }

  static async deleteArticle(id: string, userId: string, userRole: string) {
    // Check permissions
    const { data: article } = await supabase
      .from("articles")
      .select("author_id")
      .eq("id", id)
      .single();

    if (!article) {
      throw new Error("Article not found");
    }

    if (article.author_id !== userId && userRole !== "admin") {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) throw error;

    await invalidateCache([CACHE_TAGS.ARTICLES]);
  }

  private static calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Get pending reviews for doctors
  static getPendingReviews = createCachedFunction(
    async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          `
          *,
          author:doctors(name, title),
          category:article_categories(name)
        `
        )
        .eq("status", "pending_review")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    ["pending-reviews"],
    [CACHE_TAGS.ARTICLES],
    CACHE_DURATIONS.SHORT
  );

  static getPublishedArticles = createCachedFunction(
    async (
      filters: {
        category_id?: string;
        limit?: number;
        offset?: number;
      } = {}
    ) => {
      let query = supabase
        .from("articles")
        .select(
          `
        *,
        author:admin_users(name, role, profile_image_url),
        category:article_categories(name)
      `
        )
        .eq("is_published", true)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    ["published-articles"],
    [CACHE_TAGS.ARTICLES],
    CACHE_DURATIONS.SHORT
  );

  static getFeaturedArticle = createCachedFunction(
    async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          `
        *,
        author:admin_users(name, role, profile_image_url),
        category:article_categories(name)
      `
        )
        .eq("is_published", true)
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // If no featured article, get the most recent published article
        const { data: fallback, error: fallbackError } = await supabase
          .from("articles")
          .select(
            `
          *,
          author:doctors(name, title, profile_image_url),
          category:article_categories(name)
        `
          )
          .eq("is_published", true)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (fallbackError) throw fallbackError;
        return fallback;
      }
      return data;
    },
    ["featured-article"],
    [CACHE_TAGS.ARTICLES],
    CACHE_DURATIONS.SHORT
  );

  static getArticleBySlug = createCachedFunction(
    async (id: string) => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          `
        *,
        author:admin_users(name, role, profile_image_url),
        category:article_categories(name)
      `
        )
        .eq("id", id)
        .eq("is_published", true)
        .eq("status", "approved")
        .single();
      if (error) return null;
      return data;
    },
    ["article-by-slug"],
    [CACHE_TAGS.ARTICLES],
    CACHE_DURATIONS.MEDIUM
  );
  static getArticleById = createCachedFunction(
    async (id: string) => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          `
        *,
        author:admin_users(name, role, profile_image_url),
        category:article_categories(name)
      `
        )
        .eq("id", id)
        .eq("is_published", true)
        .eq("status", "approved")
        .single();

      if (error) return null;
      return data;
    },
    ["article-by-id"],
    [CACHE_TAGS.ARTICLES],
    CACHE_DURATIONS.MEDIUM
  );

  static async incrementViewCount(articleId: string) {
    // Fetch current read_count
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("read_count")
      .eq("id", articleId)
      .single();

    if (fetchError) throw fetchError;

    const newReadCount = (article?.read_count || 0) + 1;

    const { error: updateError } = await supabase
      .from("articles")
      .update({ read_count: newReadCount })
      .eq("id", articleId);

    if (updateError) throw updateError;

    // Invalidate cache
    await invalidateCache([CACHE_TAGS.ARTICLES]);
  }
  static async incrementViewCountAction(articleId: string) {
    // Fetch current read_count
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("read_count")
      .eq("id", articleId)
      .single();

    if (fetchError || !article) {
      return { error: fetchError || new Error("Article not found") };
    }

    const newReadCount = (article.read_count || 0) + 1;

    // Update read_count
    const { error: updateError } = await supabase
      .from("articles")
      .update({ read_count: newReadCount })
      .eq("id", articleId);

    return {
      article: { ...article, read_count: newReadCount },
      error: updateError,
    };
  }

  static getRelatedArticles = createCachedFunction(
    async (articleId: string, categoryId: string | null, limit = 4) => {
      let query = supabase
        .from("articles")
        .select(
          `
        *,
        category:article_categories(name)
      `
        )
        .eq("is_published", true)
        .eq("status", "approved")
        .neq("id", articleId)
        .order("created_at", { ascending: false })
        .limit(limit);

      // Prefer articles from the same category
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    ["related-articles"],
    [CACHE_TAGS.ARTICLES],
    CACHE_DURATIONS.SHORT
  );
}
