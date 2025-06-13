"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ArticleCard from "@/components/public/article-card"
import { ArticlesSidebar } from "@/components/public/articles-sidebar"
import { SearchBar } from "@/components/public/search-bar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Article {
  id: string
  title: string
  content: string
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

interface Category {
  id: string
  name: string
  slug: string
  article_count: number
}

export function ArticlesPageContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const searchParams = useSearchParams()
  const router = useRouter()

  const articlesPerPage = 12

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    const searchParam = searchParams.get("search")

    if (categoryParam) {
      setSelectedCategories([categoryParam])
    }
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [searchParams])

  // Fetch articles and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          fetch("/api/public/articles"),
          fetch("/api/public/categories"),
        ])

        const articlesData = await articlesRes.json()
        const categoriesData = await categoriesRes.json()

        setArticles(articlesData.articles || [])
        setCategories(categoriesData.categories || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter articles based on search and categories
  const filteredArticles = useMemo(() => {
    let filtered = articles

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.category?.name.toLowerCase().includes(query),
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((article) => article.category && selectedCategories.includes(article.category.id))
    }

    return filtered
  }, [articles, searchQuery, selectedCategories])

  // Paginate filtered articles
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * articlesPerPage
    const endIndex = startIndex + articlesPerPage
    const paginated = filteredArticles.slice(startIndex, endIndex)

    setTotalPages(Math.ceil(filteredArticles.length / articlesPerPage))

    return paginated
  }, [filteredArticles, currentPage, articlesPerPage])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (searchQuery.trim()) {
      params.set("search", searchQuery)
    }

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories[0]) // For simplicity, use first category
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "/articles"
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, selectedCategories, router])

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setCurrentPage(1)
    router.replace("/articles")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <ArticlesSidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onClearFilters={clearFilters}
          totalArticles={filteredArticles.length}
        />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search articles by title, content, or category..."
          />
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredArticles.length === 0 ? (
              "No articles found"
            ) : (
              <>
                Showing {(currentPage - 1) * articlesPerPage + 1}-
                {Math.min(currentPage * articlesPerPage, filteredArticles.length)} of {filteredArticles.length} articles
              </>
            )}
          </p>

          {(searchQuery || selectedCategories.length > 0) && (
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or clearing the filters.</p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {paginatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
