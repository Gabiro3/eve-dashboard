"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function AdBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-1">
      <div className="bg-white rounded-xl p-8 relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                EVE HEALTH
              </div>
              <div className="text-sm text-gray-600">Ads • 150x170px</div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Health Content</h3>
            <p className="text-gray-600 mb-4">
              Get access to expert-reviewed health articles and personalized wellness tips.
            </p>

            <Button className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white" onClick={() => router.push('/contact')}>
              Learn More
            </Button>
          </div>

          <div className="hidden md:block">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-4xl">💊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
