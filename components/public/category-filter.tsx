"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  article_count?: number
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Top Categories</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => scroll("left")} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => scroll("right")} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* All Categories Option */}
        <Link href="/" className="flex-shrink-0">
          <div
            className={`relative h-32 w-48 rounded-xl overflow-hidden group cursor-pointer ${
              !selectedCategory ? "ring-2 ring-pink-500" : ""
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="font-bold text-lg mb-1">All Categories</h3>
              <p className="text-sm opacity-90">View All</p>
            </div>
          </div>
        </Link>

        {/* Category Cards */}
        {categories.map((category) => (
          <Link key={category.id} href={`/?category=${category.id}`} className="flex-shrink-0">
            <div
              className={`relative h-32 w-48 rounded-xl overflow-hidden group cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedCategory === category.id ? "ring-2 ring-pink-500" : ""
              }`}
            >
              {/* Background Image - You can customize this based on category */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500" />
              <div className="absolute inset-0 bg-black/40" />

              {/* Category Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <h3 className="font-bold text-lg mb-1 text-center">{category.name}</h3>
                <p className="text-sm opacity-90">{category.article_count || 0} Posts</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Active Filter Display */}
      {selectedCategory && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filtered by:</span>
          <Badge variant="secondary" className="flex items-center gap-2">
            {categories.find((c) => c.id === selectedCategory)?.name}
            <Link href="/" className="hover:text-red-600">
              ×
            </Link>
          </Badge>
        </div>
      )}
    </div>
  )
}
