"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { QuizService } from "@/lib/services/quiz-service"
import type { Quiz, QuizQuestion } from "@/types/quiz"
import { Plus, Trash2, Save, ArrowLeft, X, Check, AlertCircle, Eye, Move, Copy, RotateCcw } from "lucide-react"
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
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import Link from "next/link"

const CATEGORIES = [
  "Women's Health",
  "Pregnancy & Maternity",
  "Mental Health",
  "Nutrition",
  "Fitness",
  "General Health",
  "Sexual Health",
  "Reproductive Health",
]

interface QuestionForm extends Omit<QuizQuestion, "id" | "quiz_id" | "created_at"> {
  id?: string
  isNew?: boolean
  isModified?: boolean
}

export default function EditQuizPage() {
  const [user, setUser] = useState<any>(null)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    category: "",
    image_url: "",
    time_limit: 10,
    difficulty: 1,
    tags: [] as string[],
    is_published: false,
  })

  // Questions state
  const [questions, setQuestions] = useState<QuestionForm[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

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
    loadQuiz()
  }, [params.id])

  useEffect(() => {
    // Track unsaved changes
    if (quiz) {
      const hasQuizChanges =
        quizForm.title !== quiz.title ||
        quizForm.description !== quiz.description ||
        quizForm.category !== quiz.category ||
        quizForm.image_url !== (quiz.image_url || "") ||
        quizForm.time_limit !== quiz.time_limit ||
        quizForm.difficulty !== quiz.difficulty ||
        JSON.stringify(quizForm.tags) !== JSON.stringify(quiz.tags) ||
        quizForm.is_published !== quiz.is_published

      const hasQuestionChanges = questions.some((q) => q.isNew || q.isModified)

      setHasUnsavedChanges(hasQuizChanges || hasQuestionChanges)
    }
  }, [quizForm, questions, quiz])

  const loadQuiz = async () => {
    try {
      const quizData = await QuizService.getQuizWithQuestions(params.id as string)
      if (!quizData) {
        toast({
          title: "Error",
          description: "Quiz not found",
          variant: "destructive",
        })
        router.push("/dashboard/quizzes")
        return
      }

      setQuiz(quizData)
      setQuizForm({
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        image_url: quizData.image_url || "",
        time_limit: quizData.time_limit,
        difficulty: quizData.difficulty,
        tags: quizData.tags,
        is_published: quizData.is_published,
      })

      const formattedQuestions: QuestionForm[] = (quizData.questions || []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer_index: q.correct_answer_index,
        explanation: q.explanation,
        image_url: q.image_url,
        order_index: q.order_index,
        isNew: false,
        isModified: false,
      }))

      setQuestions(formattedQuestions)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quiz",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    const newQuestion: QuestionForm = {
      question: "",
      options: ["", "", "", ""],
      correct_answer_index: 0,
      explanation: "",
      order_index: questions.length,
      isNew: true,
      isModified: false,
    }
    setQuestions([...questions, newQuestion])
  }

  const duplicateQuestion = (index: number) => {
    const originalQuestion = questions[index]
    const duplicatedQuestion: QuestionForm = {
      ...originalQuestion,
      id: undefined,
      question: `${originalQuestion.question} (Copy)`,
      order_index: questions.length,
      isNew: true,
      isModified: false,
    }
    setQuestions([...questions, duplicatedQuestion])
  }

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions]
    updated[index] = {
      ...updated[index],
      [field]: value,
      isModified: !updated[index].isNew,
    }
    setQuestions(updated)
  }

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    const newOptions = [...updated[questionIndex].options]
    newOptions[optionIndex] = value
    updated[questionIndex] = {
      ...updated[questionIndex],
      options: newOptions,
      isModified: !updated[questionIndex].isNew,
    }
    setQuestions(updated)
  }

  const removeQuestion = async (index: number) => {
    const question = questions[index]

    if (question.id && !question.isNew) {
      // Delete from database
      try {
        await QuizService.deleteQuestion(question.id)
        toast({
          title: "Success",
          description: "Question deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete question",
          variant: "destructive",
        })
        return
      }
    }

    // Remove from local state and reorder
    const updated = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order_index: i }))

    setQuestions(updated)
    setDeleteQuestionId(null)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order indices
    const reorderedQuestions = items.map((item, index) => ({
      ...item,
      order_index: index,
      isModified: !item.isNew,
    }))

    setQuestions(reorderedQuestions)
  }

  const addTag = () => {
    if (currentTag.trim() && !quizForm.tags.includes(currentTag.trim())) {
      setQuizForm({
        ...quizForm,
        tags: [...quizForm.tags, currentTag.trim()],
      })
      setCurrentTag("")
    }
  }

  const removeTag = (tag: string) => {
    setQuizForm({
      ...quizForm,
      tags: quizForm.tags.filter((t) => t !== tag),
    })
  }

  const validateForm = () => {
    if (!quizForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Quiz title is required",
        variant: "destructive",
      })
      return false
    }

    if (!quizForm.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Quiz description is required",
        variant: "destructive",
      })
      return false
    }

    if (!quizForm.category) {
      toast({
        title: "Validation Error",
        description: "Quiz category is required",
        variant: "destructive",
      })
      return false
    }

    if (questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one question is required",
        variant: "destructive",
      })
      return false
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        toast({
          title: "Validation Error",
          description: `Question ${i + 1} text is required`,
          variant: "destructive",
        })
        return false
      }

      if (q.options.some((opt) => !opt.trim())) {
        toast({
          title: "Validation Error",
          description: `All options for question ${i + 1} are required`,
          variant: "destructive",
        })
        return false
      }

      if (!q.explanation.trim()) {
        toast({
          title: "Validation Error",
          description: `Explanation for question ${i + 1} is required`,
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm() || !quiz) return

    setSaving(true)
    try {
      // Update quiz
      await QuizService.updateQuiz(quiz.id, quizForm)

      // Handle questions
      for (const question of questions) {
        if (question.isNew) {
          // Create new question
          await QuizService.createQuestion({
            quiz_id: quiz.id,
            question: question.question,
            options: question.options,
            correct_answer_index: question.correct_answer_index,
            explanation: question.explanation,
            image_url: question.image_url,
            order_index: question.order_index,
          })
        } else if (question.isModified && question.id) {
          // Update existing question
          await QuizService.updateQuestion(question.id, {
            question: question.question,
            options: question.options,
            correct_answer_index: question.correct_answer_index,
            explanation: question.explanation,
            image_url: question.image_url,
            order_index: question.order_index,
          })
        }
      }

      toast({
        title: "Success",
        description: "Quiz updated successfully",
      })

      // Reload quiz to reset modification flags
      await loadQuiz()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quiz",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      router.push("/dashboard/quizzes")
    }
  }

  const resetChanges = () => {
    if (quiz) {
      setQuizForm({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        image_url: quiz.image_url || "",
        time_limit: quiz.time_limit,
        difficulty: quiz.difficulty,
        tags: quiz.tags,
        is_published: quiz.is_published,
      })

      const formattedQuestions: QuestionForm[] = (quiz.questions || []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer_index: q.correct_answer_index,
        explanation: q.explanation,
        image_url: q.image_url,
        order_index: q.order_index,
        isNew: false,
        isModified: false,
      }))

      setQuestions(formattedQuestions)
    }
  }

  if (loading || !user) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

  if (!quiz) {
    return (
        <DashboardLayout user={user!}>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h2>
            <Link href="/dashboard/quizzes">
              <Button>Back to Quizzes</Button>
            </Link>
          </div>
        </DashboardLayout>
    )
  }

  return (
    <>
      <DashboardLayout user={user!}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
                <p className="text-gray-600">Modify quiz details and questions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Unsaved Changes
                </Badge>
              )}
              <Link href={`/quiz/${quiz.id}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>
              <Button onClick={resetChanges} variant="outline" disabled={!hasUnsavedChanges}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Quiz Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Basic information about your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title *</Label>
                  <Input
                    id="title"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    placeholder="Enter quiz title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={quizForm.category}
                    onValueChange={(value) => setQuizForm({ ...quizForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  placeholder="Describe what this quiz covers"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min="1"
                    max="60"
                    value={quizForm.time_limit}
                    onChange={(e) => setQuizForm({ ...quizForm, time_limit: Number.parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={quizForm.difficulty.toString()}
                    onValueChange={(value) => setQuizForm({ ...quizForm, difficulty: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Beginner</SelectItem>
                      <SelectItem value="2">2 - Easy</SelectItem>
                      <SelectItem value="3">3 - Medium</SelectItem>
                      <SelectItem value="4">4 - Hard</SelectItem>
                      <SelectItem value="5">5 - Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Cover Image URL</Label>
                  <Input
                    id="image_url"
                    value={quizForm.image_url}
                    onChange={(e) => setQuizForm({ ...quizForm, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quizForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={quizForm.is_published}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, is_published: checked })}
                />
                <Label htmlFor="is_published">Published</Label>
                <span className="text-sm text-gray-500">
                  {quizForm.is_published ? "Quiz is visible to users" : "Quiz is in draft mode"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Questions ({questions.length})</CardTitle>
                  <CardDescription>Drag to reorder questions</CardDescription>
                </div>
                <Button onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {questions.map((question, questionIndex) => (
                        <Draggable
                          key={`question-${questionIndex}`}
                          draggableId={`question-${questionIndex}`}
                          index={questionIndex}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border-l-4 ${
                                question.isNew
                                  ? "border-l-green-500"
                                  : question.isModified
                                    ? "border-l-orange-500"
                                    : "border-l-blue-500"
                              } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                            >
                              <CardHeader>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab hover:cursor-grabbing p-1"
                                    >
                                      <Move className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <CardTitle className="text-lg">
                                      Question {questionIndex + 1}
                                      {question.isNew && <Badge className="ml-2 text-xs">New</Badge>}
                                      {question.isModified && (
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          Modified
                                        </Badge>
                                      )}
                                    </CardTitle>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => duplicateQuestion(questionIndex)}
                                      title="Duplicate question"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeleteQuestionId(question.id || `temp-${questionIndex}`)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Question Text *</Label>
                                  <Textarea
                                    value={question.question}
                                    onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                                    placeholder="Enter your question"
                                    rows={2}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Answer Options *</Label>
                                  <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex items-center gap-2">
                                        <div className="flex items-center">
                                          <input
                                            type="radio"
                                            name={`correct-${questionIndex}`}
                                            checked={question.correct_answer_index === optionIndex}
                                            onChange={() =>
                                              updateQuestion(questionIndex, "correct_answer_index", optionIndex)
                                            }
                                            className="mr-2"
                                          />
                                          <span className="text-sm font-medium">
                                            {String.fromCharCode(65 + optionIndex)}
                                          </span>
                                        </div>
                                        <Input
                                          value={option}
                                          onChange={(e) =>
                                            updateQuestionOption(questionIndex, optionIndex, e.target.value)
                                          }
                                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                          className="flex-1"
                                        />
                                        {question.correct_answer_index === optionIndex && (
                                          <Check className="h-4 w-4 text-green-600" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Select the radio button next to the correct answer
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label>Explanation *</Label>
                                  <Textarea
                                    value={question.explanation}
                                    onChange={(e) => updateQuestion(questionIndex, "explanation", e.target.value)}
                                    placeholder="Explain why this answer is correct"
                                    rows={2}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Question Image URL (optional)</Label>
                                  <Input
                                    value={question.image_url || ""}
                                    onChange={(e) => updateQuestion(questionIndex, "image_url", e.target.value)}
                                    placeholder="https://..."
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {questions.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h3>
                  <p className="text-gray-600 mb-4">Start building your quiz by adding your first question.</p>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unsaved Changes Dialog */}
          <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes. Are you sure you want to leave without saving?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push("/dashboard/quizzes")}>
                  Leave Without Saving
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Question Dialog */}
          <AlertDialog open={!!deleteQuestionId} onOpenChange={() => setDeleteQuestionId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Question</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this question? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    const index = questions.findIndex(
                      (q) => q.id === deleteQuestionId || `temp-${questions.indexOf(q)}` === deleteQuestionId,
                    )
                    if (index !== -1) removeQuestion(index)
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardLayout>
    </>
  )
}
