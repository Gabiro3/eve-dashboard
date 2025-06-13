"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"
import { FileX, Home, Search, ArrowLeft } from "lucide-react"

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <FileX className="w-12 h-12 text-pink-600" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Article Not Found</h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            We couldn't find the article you're looking for. It may have been moved, deleted, or the link might be
            incorrect.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              <Link href="/articles" className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Browse All Articles
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Go to Homepage
              </Link>
            </Button>
          </div>

          {/* Go Back Link */}
          <div className="mt-8">
            <Button variant="ghost" onClick={() => window.history.back()} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Suggestions */}
          <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What you can do:</h3>
            <ul className="text-left space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                Check the URL for any typos or errors
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                Use our search feature to find similar articles
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                Browse articles by category on our articles page
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 mt-1">•</span>
                Visit our homepage for featured content
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-sm text-gray-500">
            Still having trouble?
            <Link href="/contact" className="text-pink-600 hover:text-pink-700 ml-1 underline">
              Contact our support team
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
