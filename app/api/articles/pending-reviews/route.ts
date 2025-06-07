import { type NextRequest, NextResponse } from "next/server"
import { ArticleService } from "@/lib/services/article-service"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || !["admin", "doctor"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingReviews = await ArticleService.getPendingReviews()
    return NextResponse.json({ data: pendingReviews })
  } catch (error) {
    console.error("Error fetching pending reviews:", error)
    return NextResponse.json({ error: "Failed to fetch pending reviews" }, { status: 500 })
  }
}
