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
  if (!content) return ""

  let processedContent = content

  // Handle different content formats - convert plain text to HTML if needed
  if (!content.includes("<") && content.includes("\n")) {
    processedContent = content
      .split("\n\n")
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
      .join("")
  }

  // Clean up and normalize HTML
  processedContent = processedContent
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/<p>\s*<\/p>/g, "") // Remove empty paragraphs
    .replace(/<br\s*\/?>\s*<br\s*\/?>/g, "</p><p>") // Convert double breaks to paragraphs
    .trim()

  // Process headings with comprehensive styling
  processedContent = processedContent
    .replace(
      /<h1([^>]*)>/gi,
      '<h1$1 class="text-4xl md:text-5xl font-bold text-gray-900 mt-12 mb-6 leading-tight tracking-tight border-b-2 border-pink-200 pb-4">',
    )
    .replace(
      /<h2([^>]*)>/gi,
      '<h2$1 class="text-3xl md:text-4xl font-bold text-gray-900 mt-10 mb-5 leading-tight tracking-tight">',
    )
    .replace(/<h3([^>]*)>/gi, '<h3$1 class="text-2xl md:text-3xl font-semibold text-gray-900 mt-8 mb-4 leading-tight">')
    .replace(/<h4([^>]*)>/gi, '<h4$1 class="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3 leading-tight">')
    .replace(/<h5([^>]*)>/gi, '<h5$1 class="text-lg md:text-xl font-semibold text-gray-900 mt-6 mb-3 leading-tight">')
    .replace(/<h6([^>]*)>/gi, '<h6$1 class="text-base md:text-lg font-semibold text-gray-900 mt-4 mb-2 leading-tight">')

  // Process paragraphs with enhanced styling
  processedContent = processedContent.replace(
    /<p([^>]*)>/gi,
    '<p$1 class="mb-6 leading-relaxed text-gray-700 text-lg">',
  )

  // Process text formatting - Bold, Italic, Underline
  processedContent = processedContent
    .replace(/<strong([^>]*)>/gi, '<strong$1 class="font-bold text-gray-900">')
    .replace(/<b([^>]*)>/gi, '<b$1 class="font-bold text-gray-900">')
    .replace(/<em([^>]*)>/gi, '<em$1 class="italic text-gray-800">')
    .replace(/<i([^>]*)>/gi, '<i$1 class="italic text-gray-800">')
    .replace(/<u([^>]*)>/gi, '<u$1 class="underline decoration-pink-400 decoration-2 underline-offset-2">')

  // Process strikethrough and other text decorations
  processedContent = processedContent
    .replace(/<s([^>]*)>/gi, '<s$1 class="line-through text-gray-500">')
    .replace(/<del([^>]*)>/gi, '<del$1 class="line-through text-gray-500">')
    .replace(/<mark([^>]*)>/gi, '<mark$1 class="bg-yellow-200 px-1 py-0.5 rounded">')

  // Process subscript and superscript
  processedContent = processedContent
    .replace(/<sub([^>]*)>/gi, '<sub$1 class="text-xs align-sub">')
    .replace(/<sup([^>]*)>/gi, '<sup$1 class="text-xs align-super">')

  // Process lists with comprehensive styling
  processedContent = processedContent
    .replace(
      /<ul([^>]*)>/gi,
      '<ul$1 class="list-disc list-outside mb-6 space-y-2 text-gray-700 ml-6 marker:text-pink-500">',
    )
    .replace(
      /<ol([^>]*)>/gi,
      '<ol$1 class="list-decimal list-outside mb-6 space-y-2 text-gray-700 ml-6 marker:text-pink-500 marker:font-semibold">',
    )
    .replace(/<li([^>]*)>/gi, '<li$1 class="leading-relaxed pl-2 text-lg">')

  // Process nested lists
  processedContent = processedContent
    .replace(/<ul([^>]*?)class="([^"]*)"([^>]*)><li/gi, '<ul$1class="$2 mt-2 mb-2"$3><li')
    .replace(/<ol([^>]*?)class="([^"]*)"([^>]*)><li/gi, '<ol$1class="$2 mt-2 mb-2"$3><li')

  // Enhanced hyperlink processing with better styling and functionality
  processedContent = processedContent.replace(
    /<a([^>]*?)href="([^"]*)"([^>]*)>/gi,
    (match, beforeHref, href, afterHref) => {
      // Ensure proper attributes for external links
      let attributes = beforeHref + afterHref

      // Add target and rel attributes if not present
      if (!attributes.includes("target=")) {
        attributes += ' target="_blank"'
      }
      if (!attributes.includes("rel=")) {
        attributes += ' rel="noopener noreferrer"'
      }

      // Enhanced styling for links
      const linkClasses =
        "text-pink-600 hover:text-pink-700 underline decoration-2 underline-offset-2 font-medium transition-all duration-200 hover:bg-pink-50 px-1 py-0.5 rounded cursor-pointer hover:shadow-sm"

      // Add or merge classes
      if (attributes.includes("class=")) {
        attributes = attributes.replace(/class="([^"]*)"/, `class="$1 ${linkClasses}"`)
      } else {
        attributes += ` class="${linkClasses}"`
      }

      return `<a${attributes} href="${href}">`
    },
  )

  // Process blockquotes with enhanced styling
  processedContent = processedContent.replace(
    /<blockquote([^>]*)>/gi,
    '<blockquote$1 class="border-l-4 border-pink-300 pl-6 py-4 mb-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-r-lg italic text-gray-700 text-lg relative">',
  )

  // Process inline code with styling
  processedContent = processedContent.replace(
    /<code([^>]*?)>(?![^<]*<\/pre>)/gi,
    '<code$1 class="bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono border">',
  )

  // Process code blocks with enhanced styling
  processedContent = processedContent.replace(
    /<pre([^>]*)>/gi,
    '<pre$1 class="bg-gray-900 text-gray-100 rounded-lg p-6 mb-6 overflow-x-auto border shadow-lg">',
  )

  // Process code within pre blocks
  processedContent = processedContent.replace(
    /<pre([^>]*?)><code([^>]*?)>/gi,
    '<pre$1><code$2 class="text-gray-100 font-mono text-sm leading-relaxed">',
  )

  // Process images with comprehensive styling
  processedContent = processedContent.replace(
    /<img([^>]*?)src="([^"]*)"([^>]*?)>/gi,
    '<img$1src="$2"$3 class="rounded-lg shadow-lg my-8 max-w-full h-auto mx-auto block border transition-transform duration-300 hover:scale-105" loading="lazy">',
  )

  // Process tables with comprehensive styling
  processedContent = processedContent
    .replace(
      /<table([^>]*)>/gi,
      '<div class="overflow-x-auto mb-8"><table$1 class="min-w-full border-collapse bg-white rounded-lg shadow-sm overflow-hidden">',
    )
    .replace(/<\/table>/gi, "</table></div>")
    .replace(/<thead([^>]*)>/gi, '<thead$1 class="bg-gray-50">')
    .replace(/<tbody([^>]*)>/gi, '<tbody$1 class="divide-y divide-gray-200">')
    .replace(
      /<th([^>]*)>/gi,
      '<th$1 class="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200">',
    )
    .replace(/<td([^>]*)>/gi, '<td$1 class="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">')
    .replace(/<tr([^>]*)>/gi, '<tr$1 class="hover:bg-gray-50 transition-colors duration-150">')

  // Process horizontal rules
  processedContent = processedContent.replace(
    /<hr([^>]*)>/gi,
    '<hr$1 class="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent">',
  )

  // Process definition lists
  processedContent = processedContent
    .replace(/<dl([^>]*)>/gi, '<dl$1 class="mb-6 space-y-4">')
    .replace(/<dt([^>]*)>/gi, '<dt$1 class="font-semibold text-gray-900 text-lg">')
    .replace(/<dd([^>]*)>/gi, '<dd$1 class="ml-4 text-gray-700 leading-relaxed">')

  // Process abbreviations and acronyms
  processedContent = processedContent.replace(
    /<abbr([^>]*?)title="([^"]*)"([^>]*)>/gi,
    '<abbr$1title="$2"$3 class="border-b border-dotted border-gray-400 cursor-help">',
  )

  // Process keyboard input styling
  processedContent = processedContent.replace(
    /<kbd([^>]*)>/gi,
    '<kbd$1 class="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-sm font-mono shadow-sm">',
  )

  // Process sample output
  processedContent = processedContent.replace(
    /<samp([^>]*)>/gi,
    '<samp$1 class="bg-gray-50 border-l-4 border-gray-300 pl-4 py-2 font-mono text-sm block my-4">',
  )

  // Process variable text
  processedContent = processedContent.replace(/<var([^>]*)>/gi, '<var$1 class="italic text-blue-600 font-medium">')

  // Process small text
  processedContent = processedContent.replace(/<small([^>]*)>/gi, '<small$1 class="text-sm text-gray-600">')

  // Process citations
  processedContent = processedContent.replace(
    /<cite([^>]*)>/gi,
    '<cite$1 class="italic text-gray-600 font-medium">',
  )

  // Process addresses
  processedContent = processedContent.replace(
    /<address([^>]*)>/gi,
    '<address$1 class="not-italic bg-gray-50 p-4 rounded border-l-4 border-blue-300 mb-6">',
  )

  // Process figure and figcaption
  processedContent = processedContent
    .replace(/<figure([^>]*)>/gi, '<figure$1 class="my-8 text-center">')
    .replace(/<figcaption([^>]*)>/gi, '<figcaption$1 class="mt-2 text-sm text-gray-600 italic">')

  // Process details and summary (collapsible content)
  processedContent = processedContent
    .replace(/<details([^>]*)>/gi, '<details$1 class="mb-6 border border-gray-200 rounded-lg overflow-hidden">')
    .replace(
      /<summary([^>]*)>/gi,
      '<summary$1 class="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 font-medium text-gray-900 transition-colors duration-150">',
    )

  // Handle font styling attributes with Quicksand support
  processedContent = processedContent.replace(
    /<span([^>]*?)style="([^"]*?)"([^>]*)>/gi,
    (match, before, style, after) => {
      const classes = []

      // Parse font-weight
      if (style.includes("font-weight:") || style.includes("font-weight :")) {
        if (style.match(/font-weight\s*:\s*(bold|700|800|900)/i)) {
          classes.push("font-bold")
        } else if (style.match(/font-weight\s*:\s*(600)/i)) {
          classes.push("font-semibold")
        } else if (style.match(/font-weight\s*:\s*(500)/i)) {
          classes.push("font-medium")
        }
      }

      // Parse font-style
      if (style.match(/font-style\s*:\s*italic/i)) {
        classes.push("italic")
      }

      // Parse font-family with Quicksand support
      const fontFamilyMatch = style.match(/font-family\s*:\s*([^;]+)/i)
      if (fontFamilyMatch) {
        const fontFamily = fontFamilyMatch[1].toLowerCase().trim().replace(/['"]/g, "")
        if (fontFamily.includes("quicksand")) {
          classes.push("font-quicksand")
        }
      }

      // Parse text-decoration
      if (style.match(/text-decoration\s*:\s*underline/i)) {
        classes.push("underline decoration-2 underline-offset-2")
      }
      if (style.match(/text-decoration\s*:\s*line-through/i)) {
        classes.push("line-through")
      }

      // Parse color (basic color mapping)
      const colorMatch = style.match(/color\s*:\s*([^;]+)/i)
      if (colorMatch) {
        const color = colorMatch[1].toLowerCase().trim()
        if (color.includes("red")) classes.push("text-red-600")
        else if (color.includes("blue")) classes.push("text-blue-600")
        else if (color.includes("green")) classes.push("text-green-600")
        else if (color.includes("purple")) classes.push("text-purple-600")
        else if (color.includes("pink")) classes.push("text-pink-600")
        else if (color.includes("gray") || color.includes("grey")) classes.push("text-gray-600")
      }

      // Parse background-color
      const bgColorMatch = style.match(/background-color\s*:\s*([^;]+)/i)
      if (bgColorMatch) {
        const bgColor = bgColorMatch[1].toLowerCase().trim()
        if (bgColor.includes("yellow")) classes.push("bg-yellow-200")
        else if (bgColor.includes("blue")) classes.push("bg-blue-100")
        else if (bgColor.includes("green")) classes.push("bg-green-100")
        else if (bgColor.includes("red")) classes.push("bg-red-100")
        else if (bgColor.includes("purple")) classes.push("bg-purple-100")
        else if (bgColor.includes("pink")) classes.push("bg-pink-100")
      }

      // Parse font-size
      const fontSizeMatch = style.match(/font-size\s*:\s*([^;]+)/i)
      if (fontSizeMatch) {
        const fontSize = fontSizeMatch[1].toLowerCase().trim()
        if (fontSize.includes("small") || fontSize.includes("12px") || fontSize.includes("0.75rem")) {
          classes.push("text-sm")
        } else if (fontSize.includes("large") || fontSize.includes("18px") || fontSize.includes("1.125rem")) {
          classes.push("text-lg")
        } else if (fontSize.includes("x-large") || fontSize.includes("24px") || fontSize.includes("1.5rem")) {
          classes.push("text-xl")
        }
      }

      // Parse text-align
      if (style.match(/text-align\s*:\s*center/i)) {
        classes.push("text-center")
      } else if (style.match(/text-align\s*:\s*right/i)) {
        classes.push("text-right")
      } else if (style.match(/text-align\s*:\s*justify/i)) {
        classes.push("text-justify")
      }

      const classString = classes.length > 0 ? ` class="${classes.join(" ")}"` : ""
      return `<span${before}${classString}${after}>`
    },
  )

  // Handle div styling for text alignment and other block-level styling
  processedContent = processedContent.replace(
    /<div([^>]*?)style="([^"]*?)"([^>]*)>/gi,
    (match, before, style, after) => {
      const classes = []

      if (style.match(/text-align\s*:\s*center/i)) {
        classes.push("text-center")
      } else if (style.match(/text-align\s*:\s*right/i)) {
        classes.push("text-right")
      } else if (style.match(/text-align\s*:\s*justify/i)) {
        classes.push("text-justify")
      }

      if (style.match(/margin/i) || style.match(/padding/i)) {
        classes.push("my-4")
      }

      const classString = classes.length > 0 ? ` class="${classes.join(" ")}"` : ""
      return `<div${before}${classString}${after}>`
    },
  )

  // Clean up any remaining empty class attributes
  processedContent = processedContent.replace(/\s+class=""\s*/g, " ")

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
                  src={article.author.profile_image_url || "/placeholder.svg"}
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
                <div className="font-semibold text-gray-900 text-lg">{article.author.name}</div>
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
