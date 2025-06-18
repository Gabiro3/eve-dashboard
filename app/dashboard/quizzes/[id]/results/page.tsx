"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { QuizService } from "@/lib/services/quiz-service"
import type { Quiz, QuizResult } from "@/types/quiz"
import {
  ArrowLeft,
  Users,
  Target,
  Clock,
  Award,
  BarChart3,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"

interface QuizAnalytics {
  totalAttempts: number
  averageScore: number
  completionRate: number
  averageTimeSpent: number
  topScore: number
  recentAttempts: QuizResult[]
  scoreDistribution: { range: string; count: number }[]
  dailyAttempts: { date: string; attempts: number }[]
  questionAnalytics: {
    question: string
    correctRate: number
    totalAnswers: number
  }[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function QuizResultsPage() {
  const [user, setUser] = useState<any>(null)
  const params = useParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [results, setResults] = useState<QuizResult[]>([])
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null)

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

  useEffect(() => {
    loadQuizResults()
  }, [params.id])

  const loadQuizResults = async () => {
    try {
      const [quizData, resultsData] = await Promise.all([
        QuizService.getQuizWithQuestions(params.id as string),
        QuizService.getQuizResults(params.id as string),
      ])

      if (!quizData) {
        toast({
          title: "Error",
          description: "Quiz not found",
          variant: "destructive",
        })
        return
      }

      setQuiz(quizData)
      setResults(resultsData)
      setAnalytics(calculateAnalytics(quizData, resultsData))
    } catch (error) {
        console.log(error)
      toast({
        title: "Error",
        description: "Failed to load quiz results",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (quiz: Quiz, results: QuizResult[]): QuizAnalytics => {
    if (results.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0,
        averageTimeSpent: 0,
        topScore: 0,
        recentAttempts: [],
        scoreDistribution: [],
        dailyAttempts: [],
        questionAnalytics: [],
      }
    }

    const totalAttempts = results.length
    const totalQuestions = quiz.questions?.length || 0
    const averageScore = (results.reduce((sum, r) => sum + r.score, 0) / totalAttempts / totalQuestions) * 100
    const completionRate = 100 // All results are completed attempts
    const averageTimeSpent = results.reduce((sum, r) => sum + r.time_spent, 0) / totalAttempts
    const topScore = Math.max(...results.map((r) => (r.score / r.total_questions) * 100))

    // Score distribution
    const scoreRanges = ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"]
    const scoreDistribution = scoreRanges.map((range) => {
      const [min, max] = range.split("-").map((s) => Number.parseInt(s.replace("%", "")))
      const count = results.filter((r) => {
        const percentage = (r.score / r.total_questions) * 100
        return percentage >= min && percentage <= (max || 100)
      }).length
      return { range, count }
    })

    // Daily attempts (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const dailyAttempts = last30Days.map((date) => ({
      date,
      attempts: results.filter((r) => r.completed_at.startsWith(date)).length,
    }))

    // Question analytics
    const questionAnalytics = (quiz.questions || []).map((question, index) => {
      const questionAnswers = results.flatMap((r) => r.answers.filter((a) => a.question_id === question.id))
      const correctAnswers = questionAnswers.filter((a) => a.is_correct).length
      const totalAnswers = questionAnswers.length

      return {
        question: `Q${index + 1}: ${question.question.substring(0, 50)}...`,
        correctRate: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
        totalAnswers,
      }
    })

    return {
      totalAttempts,
      averageScore: Math.round(averageScore),
      completionRate,
      averageTimeSpent: Math.round(averageTimeSpent),
      topScore: Math.round(topScore),
      recentAttempts: results.slice(0, 10),
      scoreDistribution,
      dailyAttempts,
      questionAnalytics,
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const exportResults = () => {
    if (!results.length) return

    const csvContent = [
      ["User", "Score", "Percentage", "Time Spent", "Completed At"],
      ...results.map((result) => [
        `User ${result.user_id.substring(0, 8)}...`,
        `${result.score}/${result.total_questions}`,
        `${Math.round((result.score / result.total_questions) * 100)}%`,
        formatTime(result.time_spent),
        format(new Date(result.completed_at), "yyyy-MM-dd HH:mm"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quiz-results-${quiz?.title.replace(/\s+/g, "-").toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || !user) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

  if (!quiz || !analytics) {
    return (
      <>
        <DashboardLayout user={user!}>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h2>
            <Link href="/dashboard/quizzes">
              <Button>Back to Quizzes</Button>
            </Link>
          </div>
        </DashboardLayout>
      </>
    )
  }

  return (
    <>
      <DashboardLayout user={user!}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/quizzes">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quizzes
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-gray-600">Quiz Results & Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadQuizResults} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportResults} variant="outline" disabled={results.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
                <Button variant="outline">Edit Quiz</Button>
              </Link>
            </div>
          </div>

          {/* Quiz Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">
                    {quiz.category}
                  </Badge>
                  <div className="text-sm text-gray-600">Category</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{quiz.questions?.length || 0}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{quiz.time_limit} min</div>
                  <div className="text-sm text-gray-600">Time Limit</div>
                </div>
                <div className="text-center">
                  <Badge variant={quiz.is_published ? "default" : "secondary"}>
                    {quiz.is_published ? "Published" : "Draft"}
                  </Badge>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalAttempts}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.recentAttempts.length > 0 &&
                    `Latest: ${formatDistanceToNow(new Date(analytics.recentAttempts[0].completed_at))} ago`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.averageScore}%</div>
                <Progress value={analytics.averageScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.topScore}%</div>
                <p className="text-xs text-muted-foreground">Best performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(analytics.averageTimeSpent)}</div>
                <p className="text-xs text-muted-foreground">Per attempt</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>How users performed on this quiz</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Attempts */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Attempts</CardTitle>
                <CardDescription>Quiz attempts over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyAttempts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), "MM/dd")} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => format(new Date(value), "MMM dd, yyyy")} />
                    <Line type="monotone" dataKey="attempts" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Question Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Question Performance</CardTitle>
              <CardDescription>How well users answered each question</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.questionAnalytics.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{question.question}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{question.totalAnswers} answers</span>
                        <Badge
                          variant={
                            question.correctRate >= 70
                              ? "default"
                              : question.correctRate >= 50
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {Math.round(question.correctRate)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={question.correctRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Attempts</CardTitle>
              <CardDescription>Latest quiz submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentAttempts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentAttempts.map((result, index) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {result.user_id.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">User {result.user_id.substring(0, 8)}...</div>
                          <div className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(result.completed_at))} ago
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">
                            {result.score}/{result.total_questions}
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round((result.score / result.total_questions) * 100)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatTime(result.time_spent)}</div>
                          <div className="text-sm text-gray-600">Time spent</div>
                        </div>
                        {result.score / result.total_questions >= 0.7 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No attempts yet</h3>
                  <p className="text-gray-600">This quiz hasn't been taken by any users yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  )
}
