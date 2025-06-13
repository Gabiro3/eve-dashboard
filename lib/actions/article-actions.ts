"use server"

import { ArticleService } from "@/lib/services/article-service"
import { revalidateTag } from "next/cache"

/**
 * Server action to increment the view count of an article
 */
export async function updateArticleViewCount(articleId: string) {
  try {
    // Update the view count in the database
    const { error } = await ArticleService.incrementViewCountAction(articleId)

    if (error) {
      throw new Error(`Failed to update view count: ${error.message}`)
    }

    // Revalidate the cache for this article
    revalidateTag("articles")

    return { success: true }
  } catch (error) {
    console.error("Error updating view count:", error)
    return { success: false, error: (error as Error).message }
  }
}
