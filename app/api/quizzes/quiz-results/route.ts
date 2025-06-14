import { type NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/lib/services/quiz-service"
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resultData = await request.json()
    const result = await QuizService.saveQuizResult({
      ...resultData,
      user_id: user.id,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error saving quiz result:", error)
    return NextResponse.json({ error: "Failed to save quiz result" }, { status: 500 })
  }
}
