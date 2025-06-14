import { type NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/lib/services/quiz-service"
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get("published")

    let quizzes
    if (published === "true") {
      quizzes = await QuizService.getPublishedQuizzes()
    } else {
      // Check if user is admin for all quizzes
      const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
      quizzes = await QuizService.getAllQuizzes()
    }

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizData = await request.json()
    const quiz = await QuizService.createQuiz({
      ...quizData,
      shared_by_user_id: user.id,
    })

    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}
