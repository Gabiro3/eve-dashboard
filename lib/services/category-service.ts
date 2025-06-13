import { supabaseAdmin } from "@/lib/supabase"
import { createCachedFunction, CACHE_TAGS, CACHE_DURATIONS } from "@/lib/cache"

export class CategoryService {
  static getCategories = createCachedFunction(
    async () => {
      const { data, error } = await supabaseAdmin
        .from("article_categories")
        .select(`
          *,
          article_count:articles(count)
        `)
        .order("name")

      if (error) throw error

      // Transform the count data
      return data.map((category) => ({
        ...category,
        article_count: category.article_count?.[0]?.count || 0,
      }))
    },
    ["categories"],
    [CACHE_TAGS.CATEGORIES],
    CACHE_DURATIONS.LONG,
  )

  static getCategoryBySlug = createCachedFunction(
    async (slug: string) => {
      const { data, error } = await supabaseAdmin.from("article_categories").select("*").eq("slug", slug).single()

      if (error) throw error
      return data
    },
    ["category-by-slug"],
    [CACHE_TAGS.CATEGORIES],
    CACHE_DURATIONS.LONG,
  )
}
