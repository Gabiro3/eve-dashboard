export interface Quiz {
  id: string
  title: string
  description: string
  category: string
  image_url?: string
  time_limit: number
  difficulty: number
  tags: string[]
  is_shared: boolean
  shared_by_user_id?: string
  is_published: boolean
  created_at: string
  updated_at: string
  questions?: QuizQuestion[]
  question_count?: number
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_answer_index: number
  explanation: string
  image_url?: string
  order_index: number
  created_at: string
}

export interface QuizResult {
  id: string
  quiz_id: string
  user_id: string
  score: number
  total_questions: number
  time_spent: number
  answers: QuizAnswer[]
  completed_at: string
  is_shared_with_partner: boolean
  partner_user_id?: string
  created_at: string
}

export interface QuizAnswer {
  question_id: string
  selected_answer_index: number
  is_correct: boolean
  time_spent: number
}

export interface QuizAttempt {
  quiz: Quiz
  questions: QuizQuestion[]
  current_question: number
  answers: QuizAnswer[]
  start_time: number
  time_remaining: number
}

export interface QuizStats {
  total_quizzes: number
  total_attempts: number
  average_score: number
  popular_categories: { category: string; count: number }[]
  recent_results: QuizResult[]
}

export type QuizDifficulty = 1 | 2 | 3 | 4 | 5
export type QuizCategory =
  | "Women's Health"
  | "Pregnancy & Maternity"
  | "Mental Health"
  | "Nutrition"
  | "Fitness"
  | "General Health"
  | "Sexual Health"
  | "Reproductive Health"
