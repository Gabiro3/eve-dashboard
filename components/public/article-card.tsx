import type React from "react"
import Link from "next/link"

interface Article {
  id: string
  title: string
  excerpt: string
  slug: string
  cover_image: string | null
  created_at: string
  view_count: number
  category: {
    id: string
    name: string
    slug: string
  } | null
  author: {
    id: string
    name: string
    avatar_url: string | null
  }
}

interface ArticleCardProps {
  article: Article
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link href={`/articles/${article.id}`} className="block group">
      <div className="relative">
        <img
          src={article.cover_image || "/placeholder.svg"}
          alt={article.title}
          className="aspect-video w-full object-cover rounded-md"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors duration-300">
          {article.title}
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400 line-clamp-2">{article.excerpt}</p>
      </div>
    </Link>
  )
}

export default ArticleCard
