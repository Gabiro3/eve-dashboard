"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Calendar, User, Tag } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface ArticleContentProps {
  article: {
    id: string
    title: string
    content: string
    excerpt?: string
    featured_image_url: string | null
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

// Comprehensive content processing function
function processContent(content: string): string {
  // Handle different content formats
  let processedContent = content

  // If content appears to be plain text with line breaks, convert to HTML
  if (!content.includes("<") && content.includes("\n")) {
    processedContent = content
      .split("\n\n")
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
      .join("")
  }

  // Ensure proper paragraph spacing
  processedContent = processedContent
    .replace(/<p>\s*<\/p>/g, "") // Remove empty paragraphs
    .replace(/<p>/g, '<p class="mb-6 leading-relaxed text-gray-700">')

  // Style headings
  processedContent = processedContent
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4 leading-tight">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4 leading-tight">')
    .replace(/<h3>/g, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3 leading-tight">')
    .replace(/<h4>/g, '<h4 class="text-lg font-semibold text-gray-900 mt-6 mb-3 leading-tight">')

  // Style lists
  processedContent = processedContent
    .replace(/<ul>/g, '<ul class="list-disc list-inside mb-6 space-y-2 text-gray-700 ml-4">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-6 space-y-2 text-gray-700 ml-4">')
    .replace(/<li>/g, '<li class="leading-relaxed">')

  // Style links
  processedContent = processedContent.replace(
    /<a /g,
    '<a class="text-pink-600 hover:text-pink-700 underline font-medium" ',
  )

  // Style blockquotes
  processedContent = processedContent
    .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-pink-200 pl-6 py-4 mb-6 bg-pink-50 rounded-r-lg">')
    .replace(
      /<blockquote([^>]*)>/g,
      '<blockquote$1 class="border-l-4 border-pink-200 pl-6 py-4 mb-6 bg-pink-50 rounded-r-lg italic text-gray-700">',
    )

  // Style code blocks
  processedContent = processedContent
    .replace(/<pre>/g, '<pre class="bg-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">')
    .replace(/<code>/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">')

  // Style images
  processedContent = processedContent.replace(/<img /g, '<img class="rounded-lg shadow-sm my-6 max-w-full h-auto" ')

  return processedContent
}
export function ArticleContent({ article }: ArticleContentProps) {
  const processedContent = processContent(article.content)

  return (
    <>
      {/* Load Quicksand font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="relative h-64 md:h-96 overflow-hidden">
            <Image
              src={article.featured_image_url || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="p-6 md:p-12">
          {/* Category Badge */}
          <div className="mb-6">
            <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200 px-3 py-1 text-sm font-medium">
              {article.category.name}
            </Badge>
          </div>

          {/* Title */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && <p className="text-xl text-gray-600 leading-relaxed font-light">{article.excerpt}</p>}
          </header>

          {/* Author and Meta Info */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {article.author.profile_image_url ? (
                <Image
                  src='/logo.png'
                  alt={article.author.name}
                  width={56}
                  height={56}
                  className="rounded-full ring-2 ring-pink-100"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-pink-100">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900 text-lg">Eve Health Team</div>
                <div className="text-sm text-gray-600">{article.author.title}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pink-500" />
                <span className="font-medium">{format(new Date(article.created_at), "MMMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-pink-500" />
                <span>{article.estimated_read_time || 5} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-pink-500" />
                <span>{article.read_count.toLocaleString()} views</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="max-w-none">
            <div
              className="article-content text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-sm px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          {article.updated_at !== article.created_at && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 italic">
                Last updated {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}
              </p>
            </div>
          )}
        </div>
      </article>

      <style jsx global>{`
        .font-quicksand {
          font-family: 'Quicksand', sans-serif !important;
        }
        
        .article-content a {
          position: relative;
          display: inline;
        }
        
        .article-content a:hover {
          transform: translateY(-1px);
        }
        
        .article-content a:active {
          transform: translateY(0);
        }
      `}</style>
    </>
  )
}
