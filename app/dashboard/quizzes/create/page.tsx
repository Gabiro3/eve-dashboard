"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, Trash2, Save, ArrowLeft, X, Check, AlertCircle } from "lucide-react"
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

interface QuestionForm {
    question: string
    options: string[]
    correct_answer_index: number
    explanation: string
    image_url?: string
}

export default function CreateQuizPage() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const { toast } = useToast()

    const [loading, setLoading] = useState(false)
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

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

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question: "",
                options: ["", "", "", ""],
                correct_answer_index: 0,
                explanation: "",
            },
        ])
    }

    const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
        const updated = [...questions]
        updated[index] = { ...updated[index], [field]: value }
        setQuestions(updated)
    }

    const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
        const updated = [...questions]
        updated[questionIndex].options[optionIndex] = value
        setQuestions(updated)
    }

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index))
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
        if (!validateForm()) return

        setLoading(true)
        try {
            // Create quiz
            const quiz = await QuizService.createQuiz({ ...quizForm, is_shared: false })

            // Create questions
            for (let i = 0; i < questions.length; i++) {
                await QuizService.createQuestion({
                    quiz_id: quiz.id,
                    question: questions[i].question,
                    options: questions[i].options,
                    correct_answer_index: questions[i].correct_answer_index,
                    explanation: questions[i].explanation,
                    image_url: questions[i].image_url,
                    order_index: i,
                })
            }

            toast({
                title: "Success",
                description: "Quiz created successfully",
            })

            router.push("/dashboard/quizzes")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create quiz",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        if (quizForm.title || quizForm.description || questions.length > 0) {
            setShowUnsavedDialog(true)
        } else {
            router.push("/dashboard/quizzes")
        }
    }
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
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fc055c]"></div>
            </div>
        );
    }

    return (
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
                            <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
                            <p className="text-gray-600">Build an engaging health quiz for your users</p>
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Quiz"}
                    </Button>
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
                            <Label htmlFor="is_published">Publish immediately</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Questions ({questions.length})</CardTitle>
                                <CardDescription>Add questions with multiple choice answers</CardDescription>
                            </div>
                            <Button onClick={addQuestion}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {questions.map((question, questionIndex) => (
                            <Card key={questionIndex} className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeQuestion(questionIndex)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
                                                            onChange={() => updateQuestion(questionIndex, "correct_answer_index", optionIndex)}
                                                            className="mr-2"
                                                        />
                                                        <span className="text-sm font-medium">{String.fromCharCode(65 + optionIndex)}</span>
                                                    </div>
                                                    <Input
                                                        value={option}
                                                        onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                                                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                                        className="flex-1"
                                                    />
                                                    {question.correct_answer_index === optionIndex && (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">Select the radio button next to the correct answer</p>
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
                        ))}

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
            </div>
        </DashboardLayout>
    )
}
