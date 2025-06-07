import { type NextRequest, NextResponse } from "next/server"
import { ArticleService } from "@/lib/services/article-service"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user || !["admin", "doctor"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, review_notes } = await request.json()

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const article = await ArticleService.reviewArticle(params.id, status, review_notes || "", user.id)

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error("Error reviewing article:", error)
    return NextResponse.json({ error: "Failed to review article" }, { status: 500 })
  }
}
