import { Suspense } from "react"
import { PublicHeader } from "@/components/public/public-header"
import { FeaturedArticle } from "@/components/public/featured-article"
import { ArticleGrid } from "@/components/public/article-grid"
import { CategoryFilter } from "@/components/public/category-filter"
import { AdBanner } from "@/components/public/ad-banner"
import { AppPromoBanner } from "@/components/public/app-promo-banner"
import { PublicFooter } from "@/components/public/public-footer"
import { ArticleService } from "@/lib/services/article-service"
import { CategoryService } from "@/lib/services/category-service"

interface SearchParams {
  category?: string
  page?: string
}

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const currentPage = Number.parseInt(searchParams.page || "1")
  const selectedCategory = searchParams.category

  // Fetch data in parallel
  const [articles, categories, featuredArticle] = await Promise.all([
    ArticleService.getPublishedArticles({
      category_id: selectedCategory,
      limit: 12,
      offset: (currentPage - 1) * 12,
    }),
    CategoryService.getCategories(),
    ArticleService.getFeaturedArticle(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Featured Article Section */}
        {featuredArticle && (
          <section className="mb-12">
            <FeaturedArticle article={featuredArticle} />
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-8">
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} />
        </section>

        {/* Ad Banner */}
        <section className="mb-12">
          <AdBanner />
        </section>

        {/* Articles Grid */}
        <section className="mb-12">
          <Suspense fallback={<div>Loading articles...</div>}>
            <ArticleGrid articles={articles} currentPage={currentPage} selectedCategory={selectedCategory} />
          </Suspense>
        </section>

        {/* App Promo Banner */}
        <section className="mb-12">
          <AppPromoBanner />
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
