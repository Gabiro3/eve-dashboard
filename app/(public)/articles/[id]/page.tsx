import { notFound } from "next/navigation"
import { Suspense } from "react"
import { PublicHeader } from "@/components/public/public-header"
import { ArticleContent } from "@/components/public/article-content"
import { RelatedArticles } from "@/components/public/related-articles"
import { ShareButtons } from "@/components/public/share-buttons"
import { PublicFooter } from "@/components/public/public-footer"
import { ArticleService } from "@/lib/services/article-service"
import { Skeleton } from "@/components/ui/skeleton"
import { ViewCountUpdater } from "@/components/public/view-count-updater"

interface ArticlePageProps {
  params: {
    id: string
  }
}

// Loading component for the article content
function ArticleContentSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <Skeleton className="h-64 md:h-96 w-full" />
      <div className="p-8 md:p-12">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-18" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}

// Loading component for related articles
function RelatedArticlesSkeleton() {
  return (
    <div className="mt-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // Validate ID format (should be a valid UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(params.id)) {
    notFound()
  }

  try {
    const article = await ArticleService.getArticleById(params.id)

    if (!article) {
      notFound()
    }

    // Get related articles
    const relatedArticles = await ArticleService.getRelatedArticles(article.id, article.category_id, 4)

    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Client component that will update view count after page loads */}
            <ViewCountUpdater articleId={article.id} />

            <Suspense fallback={<ArticleContentSkeleton />}>
              <ArticleContent article={article} />
            </Suspense>

            <div className="mt-8">
              <ShareButtons
                url={`${process.env.NEXT_PUBLIC_SITE_URL || "https://blog.evehealth.app"}/articles/${article.id}`}
                title={article.title}
              />
            </div>

            <Suspense fallback={<RelatedArticlesSkeleton />}>
              <div className="mt-12">
                <RelatedArticles articles={relatedArticles} />
              </div>
            </Suspense>
          </div>
        </main>

        <PublicFooter />
      </div>
    )
  } catch (error) {
    notFound()
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps) {
  try {
    const article = await ArticleService.getArticleById(params.id)

    if (!article) {
      return {
        title: "Article Not Found | Eve Health",
        description: "The requested article could not be found.",
      }
    }

    return {
      title: `${article.title} | Eve Health`,
      description:
        article.excerpt || `Read ${article.title} on Eve Health - your trusted source for women's health information.`,
      openGraph: {
        title: article.title,
        description: article.excerpt || `Read ${article.title} on Eve Health`,
        images: article.featured_image_url ? [article.featured_image_url] : [],
        type: "article",
        publishedTime: article.created_at,
        modifiedTime: article.updated_at,
        authors: [article.author?.name || "Eve Health Team"],
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.excerpt || `Read ${article.title} on Eve Health`,
        images: article.featured_image_url ? [article.featured_image_url] : [],
      },
    }
  } catch (error) {
    return {
      title: "Article | Eve Health",
      description: "Read the latest health articles on Eve Health.",
    }
  }
}
