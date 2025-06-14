import { supabase } from "@/lib/supabase"
import type { Quiz, QuizQuestion, QuizResult, QuizStats } from "@/types/quiz"

export class QuizService {
  // Get all quizzes (admin)
  static async getAllQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        *,
        quiz_questions(count)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data.map((quiz) => ({
      ...quiz,
      question_count: quiz.quiz_questions?.[0]?.count || 0,
    }))
  }

  // Get published quizzes (public)
  static async getPublishedQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        *,
        quiz_questions(count)
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data.map((quiz) => ({
      ...quiz,
      question_count: quiz.quiz_questions?.[0]?.count || 0,
    }))
  }

  // Get quiz by ID
  static async getQuizById(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase.from("quizzes").select("*").eq("id", id).single()

    if (error) return null
    return data
  }

  // Get quiz with questions
  static async getQuizWithQuestions(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        *,
        quiz_questions(*)
      `)
      .eq("id", id)
      .single()

    if (error) return null

    return {
      ...data,
      questions: data.quiz_questions?.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index) || [],
    }
  }

  // Create quiz
  static async createQuiz(quiz: Omit<Quiz, "id" | "created_at" | "updated_at">): Promise<Quiz> {
    const { data, error } = await supabase.from("quizzes").insert(quiz).select().single()

    if (error) throw error
    return data
  }

  // Update quiz
  static async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    const { data, error } = await supabase
      .from("quizzes")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete quiz
  static async deleteQuiz(id: string): Promise<void> {
    const { error } = await supabase.from("quizzes").delete().eq("id", id)

    if (error) throw error
  }

  // Quiz Questions
  static async getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    const { data, error } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("order_index")

    if (error) throw error
    return data
  }

  static async createQuestion(question: Omit<QuizQuestion, "id" | "created_at">): Promise<QuizQuestion> {
    const { data, error } = await supabase.from("quiz_questions").insert(question).select().single()

    if (error) throw error
    return data
  }

  static async updateQuestion(id: string, updates: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const { data, error } = await supabase.from("quiz_questions").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase.from("quiz_questions").delete().eq("id", id)

    if (error) throw error
  }

  // Quiz Results
  static async saveQuizResult(result: Omit<QuizResult, "id" | "created_at">): Promise<QuizResult> {
    const { data, error } = await supabase.from("quiz_results").insert(result).select().single()

    if (error) throw error
    return data
  }

  static async getUserQuizResults(userId: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from("quiz_results")
      .select(`
        *,
        quizzes(title, category)
      `)
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })

    if (error) throw error
    return data
  }

  static async getQuizResults(quizId: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from("quiz_results")
      .select(`
        *,
        users(name, email)
      `)
      .eq("quiz_id", quizId)
      .order("completed_at", { ascending: false })

    if (error) throw error
    return data
  }

  // Quiz Statistics
  static async getQuizStats(): Promise<QuizStats> {
    const [quizzesResult, resultsResult, categoriesResult, recentResult] = await Promise.all([
      supabase.from("quizzes").select("id", { count: "exact" }),
      supabase.from("quiz_results").select("score, total_questions", { count: "exact" }),
      supabase.from("quizzes").select("category"),
      supabase
        .from("quiz_results")
        .select(`
          *,
          quizzes(title),
          users(name)
        `)
        .order("completed_at", { ascending: false })
        .limit(10),
    ])

    const totalQuizzes = quizzesResult.count || 0
    const totalAttempts = resultsResult.count || 0

    const averageScore = resultsResult.data?.length
      ? (resultsResult.data.reduce((sum, result) => sum + result.score / result.total_questions, 0) /
          resultsResult.data.length) *
        100
      : 0

    const categoryCount =
      categoriesResult.data?.reduce(
        (acc, quiz) => {
          acc[quiz.category] = (acc[quiz.category] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    const popularCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      total_quizzes: totalQuizzes,
      total_attempts: totalAttempts,
      average_score: Math.round(averageScore),
      popular_categories: popularCategories,
      recent_results: recentResult.data || [],
    }
  }
}
