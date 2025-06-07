import { unstable_cache } from "next/cache"

// Cache configuration
const CACHE_TAGS = {
  ARTICLES: "articles",
  USERS: "users",
  ANNOUNCEMENTS: "announcements",
  DONATION_CAUSES: "donation-causes",
  DOCTORS: "doctors",
  CATEGORIES: "categories",
} as const

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

export const createCachedFunction = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  tags: string[],
  revalidate: number = CACHE_DURATIONS.MEDIUM,
) => {
  return unstable_cache(fn, keyParts, {
    tags,
    revalidate,
  })
}

// Utility to invalidate cache by tags
export const invalidateCache = async (tags: string[]) => {
  const { revalidateTag } = await import("next/cache")
  tags.forEach((tag) => revalidateTag(tag))
}

export { CACHE_TAGS, CACHE_DURATIONS }
