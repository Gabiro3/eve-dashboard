"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Filter, X } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  article_count: number
}

interface ArticlesSidebarProps {
  categories: Category[]
  selectedCategories: string[]
  onCategoryToggle: (categoryId: string) => void
  onClearFilters: () => void
  totalArticles: number
}

export function ArticlesSidebar({
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
  totalArticles,
}: ArticlesSidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        {selectedCategories.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalArticles}</span> articles found
        </p>
      </div>

      <Separator className="my-4" />

      {/* Categories Filter */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Categories</h4>

        {/* Selected Categories */}
        {selectedCategories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Selected:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null

                return (
                  <Badge
                    key={categoryId}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-red-100"
                    onClick={() => onCategoryToggle(categoryId)}
                  >
                    {category.name}
                    <X className="h-3 w-3" />
                  </Badge>
                )
              })}
            </div>
            <Separator className="my-3" />
          </div>
        )}

        {/* Category List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-3">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => onCategoryToggle(category.id)}
              />
              <label
                htmlFor={category.id}
                className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">({category.article_count})</span>
                </div>
              </label>
            </div>
          ))}
        </div>

        {categories.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No categories available</p>}
      </div>

      <Separator className="my-4" />

      {/* Popular Tags */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Popular Topics</h4>
        <div className="flex flex-wrap gap-2">
          {[
            "Women's Health",
            "Nutrition",
            "Mental Health",
            "Fitness",
            "Pregnancy",
            "Wellness",
            "Prevention",
            "Lifestyle",
          ].map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-pink-50">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
