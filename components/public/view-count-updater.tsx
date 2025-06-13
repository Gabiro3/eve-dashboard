"use client"

import { useEffect } from "react"
import { updateArticleViewCount } from "@/lib/actions/article-actions"

interface ViewCountUpdaterProps {
  articleId: string
}

export function ViewCountUpdater({ articleId }: ViewCountUpdaterProps) {
  useEffect(() => {
    // Only update view count once when the component mounts
    const updateViewCount = async () => {
      try {
        await updateArticleViewCount(articleId)
      } catch (error) {
        // Silently fail - view count is not critical functionality
        console.error("Failed to update view count:", error)
      }
    }

    // Small delay to ensure the page has loaded
    const timeoutId = setTimeout(() => {
      updateViewCount()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [articleId])

  // This component doesn't render anything
  return null
}
