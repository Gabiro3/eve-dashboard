import { Suspense } from "react"
import { ArticlesPageContent } from "@/components/public/articles-page-content"
import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"

export const metadata = {
  title: "Health Articles | Eve Health - Expert Women's Health Content",
  description:
    "Browse our comprehensive collection of expert-reviewed health articles covering women's health, nutrition, mental wellness, and more.",
}

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Health Articles</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover expert-reviewed articles on women's health, wellness, nutrition, and lifestyle. Stay informed with
            the latest health insights and tips.
          </p>
        </div>

        <Suspense fallback={<ArticlesPageSkeleton />}>
          <ArticlesPageContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}

function ArticlesPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="lg:col-span-3">
        <div className="h-12 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-48 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
