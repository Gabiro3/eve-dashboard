"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Quiz, QuizQuestion, QuizAnswer } from "@/types/quiz"
import { QuizService } from "@/lib/services/quiz-service"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, RotateCcw, Home, Trophy, Target, Timer } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { formatTime } from "@/lib/utils/format-time"

type QuizState = "loading" | "ready" | "taking" | "completed" | "error"

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()

  const [state, setState] = useState<QuizState>("loading")
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
        const fetchUser = async () => {
          setLoading(true)
          const { data, error } = await supabase.auth.getUser()
      
          if (error || !data.user) {
            console.error("Error fetching user:", error)
            toast({
              title: "Error",
              description: "Unable to retrieve user info.",
              variant: "destructive",
            })
            return
          }
          const { data: profile } = await supabase.from("admin_users").select("*").eq("id", data.user.id).single()
      
            if (profile) {
              setUser(profile)
            }
        }
      
        fetchUser()
      }, [])

  // Load quiz data
  useEffect(() => {
    loadQuiz()
  }, [params.id])

  // Timer effect
  useEffect(() => {
    if (state === "taking" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [state, timeRemaining])

  const loadQuiz = async () => {
    try {
      const quizData = await QuizService.getQuizWithQuestions(params.id as string)
      if (!quizData) {
        setState("error")
        return
      }

      setQuiz(quizData)
      setQuestions(quizData.questions || [])
      setTimeRemaining(quizData.time_limit * 60) // Convert to seconds
      setState("ready")
    } catch (error) {
      setState("error")
      toast({
        title: "Error",
        description: "Failed to load quiz",
        variant: "destructive",
      })
    }
  }

  const startQuiz = () => {
    setState("taking")
    setStartTime(Date.now())
    setAnswers([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correct_answer_index

    const newAnswer: QuizAnswer = {
      question_id: currentQuestion.id,
      selected_answer_index: selectedAnswer,
      is_correct: isCorrect,
      time_spent: 0, // Will be calculated when submitting
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    } else {
      completeQuiz(updatedAnswers)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      // Restore previous answer if exists
      const previousAnswer = answers[currentQuestionIndex - 1]
      setSelectedAnswer(previousAnswer?.selected_answer_index ?? null)
    }
  }

  const handleTimeUp = () => {
    toast({
      title: "Time's Up!",
      description: "The quiz time limit has been reached.",
      variant: "destructive",
    })
    completeQuiz(answers)
  }

  const completeQuiz = async (finalAnswers: QuizAnswer[]) => {
    if (!user || !quiz) return

    const correctAnswers = finalAnswers.filter((a) => a.is_correct).length
    const totalTime = Math.floor((Date.now() - startTime) / 1000)

    try {
      await QuizService.saveQuizResult({
        quiz_id: quiz.id,
        user_id: user.id,
        score: correctAnswers,
        total_questions: questions.length,
        time_spent: totalTime,
        answers: finalAnswers,
        completed_at: new Date().toISOString(),
        is_shared_with_partner: false,
      })

      setScore(correctAnswers)
      setState("completed")
      setShowResults(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quiz results",
        variant: "destructive",
      })
    }
  }

  const handleRetakeQuiz = () => {
    setState("ready")
    setCurrentQuestionIndex(0)
    setAnswers([])
    setSelectedAnswer(null)
    setScore(0)
    setShowResults(false)
    setTimeRemaining(quiz!.time_limit * 60)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  const scorePercentage = questions.length > 0 ? (score / questions.length) * 100 : 0

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (state === "error" || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
            <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist or has been removed.</p>
            <Link href="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Quiz Header */}
        {state !== "completed" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Link href="/">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              {state === "taking" && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4" />
                    {formatTime(timeRemaining)}
                  </div>
                  <Button variant="outline" onClick={() => setShowExitDialog(true)}>
                    Exit Quiz
                  </Button>
                </div>
              )}
            </div>

            {state === "taking" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Quiz Ready State */}
        {state === "ready" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              {quiz.image_url && (
                <img
                  src={quiz.image_url || "/placeholder.svg"}
                  alt={quiz.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <CardDescription className="text-base">{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">{quiz.time_limit}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-purple-600">{quiz.difficulty}</div>
                  <div className="text-sm text-gray-600">Difficulty</div>
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-sm">
                    {quiz.category}
                  </Badge>
                </div>
              </div>

              {quiz.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {quiz.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="text-center">
                <Button onClick={startQuiz} size="lg" className="px-8">
                  Start Quiz
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Taking State */}
        {state === "taking" && currentQuestion && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              {currentQuestion.image_url && (
                <img
                  src={currentQuestion.image_url || "/placeholder.svg"}
                  alt="Question"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === index ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}
                      >
                        {selectedAnswer === index && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="font-medium text-sm text-gray-600">{String.fromCharCode(65 + index)}</span>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={handleNextQuestion} disabled={selectedAnswer === null}>
                  {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Results */}
        {state === "completed" && showResults && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Results Header */}
            <Card>
              <CardContent className="text-center py-8">
                <div className="mb-4">
                  {scorePercentage >= 80 ? (
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                  ) : scorePercentage >= 60 ? (
                    <Target className="h-16 w-16 text-blue-500 mx-auto" />
                  ) : (
                    <RotateCcw className="h-16 w-16 text-gray-500 mx-auto" />
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
                <p className="text-gray-600 mb-6">Here are your results for "{quiz.title}"</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{score}</div>
                    <div className="text-sm text-gray-600">Correct Answers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{Math.round(scorePercentage)}%</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{questions.length}</div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-8">
                  <Button onClick={handleRetakeQuiz} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button onClick={() => setShowResults(false)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review Answers
                  </Button>
                  <Link href="/">
                    <Button variant="outline">
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Answer Review */}
            {!showResults && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Answer Review</h2>
                  <Button onClick={() => setShowResults(true)} variant="outline">
                    Back to Results
                  </Button>
                </div>

                {questions.map((question, index) => {
                  const userAnswer = answers[index]
                  const isCorrect = userAnswer?.is_correct

                  return (
                    <Card
                      key={question.id}
                      className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            Question {index + 1}: {question.question}
                          </CardTitle>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => {
                            const isUserAnswer = userAnswer?.selected_answer_index === optionIndex
                            const isCorrectAnswer = question.correct_answer_index === optionIndex

                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrectAnswer
                                    ? "border-green-500 bg-green-50"
                                    : isUserAnswer
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-200"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{String.fromCharCode(65 + optionIndex)}</span>
                                  <span>{option}</span>
                                  {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                          <p className="text-blue-800">{question.explanation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Exit Quiz Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to exit? Your progress will be lost and you'll need to start over.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push("/")}>Exit Quiz</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
