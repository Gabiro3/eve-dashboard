import { type NextRequest, NextResponse } from "next/server"
import { ArticleService } from "@/lib/services/article-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const offset = (page - 1) * limit

    const articles = await ArticleService.getPublishedArticles({
      category_id: category || undefined,
      limit,
      offset,
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error("Error fetching public articles:", error)
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}
