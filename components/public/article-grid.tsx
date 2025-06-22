import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  cover_image: string | null
  slug: string
  created_at: string
  estimated_read_time: number | null
  read_count: number
  author: {
    name: string
    title: string
  }
  category: {
    name: string
  }
}

interface ArticleGridProps {
  articles: Article[]
  currentPage: number
  selectedCategory?: string
}

export function ArticleGrid({ articles, currentPage, selectedCategory }: ArticleGridProps) {
  const hasNextPage = articles.length === 12 // Assuming we fetch 12 per page
  const hasPrevPage = currentPage > 1

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (selectedCategory) params.set("category", selectedCategory)
    if (page > 1) params.set("page", page.toString())
    return `/?${params.toString()}`
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
        <div className="text-sm text-gray-500">Page {currentPage}</div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group"
          >
            {/* Article Image */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={article.cover_image || "/placeholder.svg?height=200&width=400"}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 text-gray-800 hover:bg-white">{article.category.name}</Badge>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                <Link href={`/articles/${article.id}`}>{article.title}</Link>
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.content}</p>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{article.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{article.estimated_read_time || 5}m</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{article.read_count}</span>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {(hasPrevPage || hasNextPage) && (
        <div className="flex items-center justify-center gap-4 pt-8">
          {hasPrevPage && (
            <Link href={buildPageUrl(currentPage - 1)}>
              <Button variant="outline" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </Link>
          )}

          <span className="text-sm text-gray-500">Page {currentPage}</span>

          {hasNextPage && (
            <Link href={buildPageUrl(currentPage + 1)}>
              <Button variant="outline" className="flex items-center gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      )}

      {articles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No articles found</div>
          <p className="text-gray-400">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  )
}
