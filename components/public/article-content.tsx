import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Calendar } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface ArticleContentProps {
  article: {
    id: string
    title: string
    content: string
    cover_image: string | null
    created_at: string
    updated_at: string
    estimated_read_time: number | null
    read_count: number
    author: {
      name: string
      title: string
      profile_image_url: string | null
    }
    category: {
      name: string
    }
    tags: string[] | null
  }
}

export function ArticleContent({ article }: ArticleContentProps) {
  return (
    <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Featured Image */}
      {article.cover_image && (
        <div className="relative h-64 md:h-96">
          <Image
            src={article.cover_image || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="p-8 md:p-12">
        {/* Category Badge */}
        <div className="mb-4">
          <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">{article.category.name}</Badge>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{article.title}</h1>

        {/* Author and Meta Info */}
        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {article.author.profile_image_url ? (
              <Image
                src={article.author.profile_image_url || "/placeholder.svg"}
                alt={article.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{article.author.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-900">{article.author.name}</div>
              <div className="text-sm text-gray-600">{article.author.title}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(article.created_at), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.estimated_read_time || 5} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.read_count.toLocaleString()} views</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-pink-600 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {article.updated_at !== article.created_at && (
          <div className="mt-6 text-sm text-gray-500">
            Last updated {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}
          </div>
        )}
      </div>
    </article>
  )
}
