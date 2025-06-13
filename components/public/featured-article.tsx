import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FeaturedArticleProps {
  article: {
    id: string
    title: string
    excerpt: string
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
}

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-1">
      <div className="relative overflow-hidden rounded-xl bg-white">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative h-64 md:h-96">
            <Image
              src={article.cover_image || "/placeholder.svg?height=400&width=600"}
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-pink-500 hover:bg-pink-600 text-white">{article.category.name}</Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 flex flex-col justify-center">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{article.title}</h1>

              <p className="text-gray-600 text-lg leading-relaxed">{article.excerpt}</p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{article.author.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.estimated_read_time || 5} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.read_count.toLocaleString()} views</span>
                </div>
                <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
              </div>

              {/* Read More Button */}
              <div className="pt-4">
                <Link
                  href={`/articles/${article.id}`}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  Read Full Article
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
