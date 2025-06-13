import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye } from "lucide-react"

interface RelatedArticle {
  id: string
  title: string
  excerpt: string
  featured_image_url: string | null
  slug: string
  estimated_read_time: number | null
  read_count: number
  category: {
    name: string
  }
}

interface RelatedArticlesProps {
  articles: RelatedArticle[]
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.slug}`} className="group block">
            <article className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              {/* Article Image */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={article.featured_image_url || "/placeholder.svg?height=96&width=96"}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Article Content */}
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="text-xs mb-2">
                  {article.category.name}
                </Badge>

                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors mb-2">
                  {article.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.excerpt}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{article.estimated_read_time || 5}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{article.read_count}</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
