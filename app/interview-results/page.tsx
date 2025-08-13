"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Share2,
  Trophy,
  Target,
  BookOpen,
  Calendar,
  TrendingUp,
  Code,
  MessageSquare,
  Lightbulb,
  Star,
  Loader2,
} from "lucide-react"

interface CriteriaScore {
  name: string
  score: number
  maxScore: number
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface FeedbackItem {
  text: string
  type: "strength" | "improvement"
}

interface RoadmapGoal {
  title: string
  description: string
  timeframe: string
  resources: string[]
}

interface QuestionFeedback {
  questionId: number
  questionText: string
  feedback: string
  score: number
  strengths: string[]
  improvements: string[]
}

interface AnalysisResult {
  overallScore: number
  criteriaScores: CriteriaScore[]
  feedback: FeedbackItem[]
  roadmapGoals: RoadmapGoal[]
  questionFeedback?: QuestionFeedback[]
}

const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 8,
}: { value: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 10) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-400 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{value.toFixed(1)}</div>
          <div className="text-sm text-gray-400">из 10</div>
        </div>
      </div>
    </div>
  )
}

export default function InterviewResultsPage() {
  const [isSharing, setIsSharing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Анализ ответов с помощью ИИ
  const analyzeInterviewResponses = async () => {
    try {
      setIsAnalyzing(true)
      setError(null)

      // Получаем данные интервью из localStorage
      const interviewData = localStorage.getItem("interview_responses")
      const specialty = localStorage.getItem("interview_specialty") || "frontend"

      if (!interviewData) {
        throw new Error("Данные интервью не найдены")
      }

      const responses = JSON.parse(interviewData)

      console.log("analyzeInterviewResponses: Starting analysis via API route...")

      // Используем наш API route для анализа
      const response = await fetch("/api/analyze-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses,
          specialty,
        }),
      })

      console.log("analyzeInterviewResponses: API route response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log("analyzeInterviewResponses: API route error:", errorData)

        if (response.status === 500 && errorData.error.includes("configuration error")) {
          setError("Ошибка конфигурации сервера. API ключ не настроен.")
        } else if (response.status === 401) {
          setError("Неверный API ключ на сервере.")
        } else if (response.status === 403) {
          setError("Нет доступа к модели OpenAI для анализа.")
        } else if (response.status === 429) {
          setError("Превышен лимит запросов OpenAI.")
        } else {
          setError(`Ошибка анализа: ${errorData.error || "Неизвестная ошибка"}`)
        }

        throw new Error(`Analysis API route failed: ${response.status}`)
      }

      const analysis = await response.json()
      console.log("analyzeInterviewResponses: Received analysis from API route:", analysis)

      // Validate and fix the analysis structure
      if (!analysis.overallScore || typeof analysis.overallScore !== "number") {
        console.warn("Invalid overallScore, using default")
        analysis.overallScore = 7.0
      }

      if (!analysis.criteriaScores || !Array.isArray(analysis.criteriaScores)) {
        console.warn("Invalid criteriaScores, using default")
        analysis.criteriaScores = [
          { name: "Технические знания", score: 7.0, description: "Хорошее понимание основ" },
          { name: "Практический опыт", score: 6.5, description: "Есть практический опыт" },
          { name: "Коммуникативные навыки", score: 8.0, description: "Четкая коммуникация" },
          { name: "Решение проблем", score: 7.5, description: "Хороший подход к решению задач" },
        ]
      }

      if (!analysis.strengths || !Array.isArray(analysis.strengths)) {
        console.warn("Invalid strengths, using default")
        analysis.strengths = ["Участие в интервью", "Предоставлены ответы на вопросы"]
      }

      if (!analysis.improvements || !Array.isArray(analysis.improvements)) {
        console.warn("Invalid improvements, using default")
        analysis.improvements = ["Более детальные технические объяснения", "Практика со сложными сценариями"]
      }

      if (!analysis.roadmap || !Array.isArray(analysis.roadmap)) {
        console.warn("Invalid roadmap, using default")
        analysis.roadmap = [
          {
            title: "Развитие технических навыков",
            description: "Фокус на основных технических концепциях",
            timeframe: "1-2 месяца",
            resources: ["Документация", "Онлайн курсы", "Практические проекты"],
          },
        ]
      }

      console.log("Analysis validation completed, final analysis:", {
        overallScore: analysis.overallScore,
        criteriaCount: analysis.criteriaScores.length,
        strengthsCount: analysis.strengths.length,
        improvementsCount: analysis.improvements.length,
        roadmapCount: analysis.roadmap.length,
        source: analysis.source || "unknown",
      })

      // Преобразуем в нужный формат
      const result: AnalysisResult = {
        overallScore: analysis.overallScore,
        criteriaScores: analysis.criteriaScores.map((criteria: any, index: number) => ({
          name: criteria.name || `Критерий ${index + 1}`,
          score: criteria.score || 5.0,
          maxScore: 10,
          description: criteria.description || "Требует оценки",
          icon: [Code, Target, MessageSquare, Lightbulb][index] || Code,
        })),
        feedback: [
          ...analysis.strengths.map((text: string) => ({ text, type: "strength" as const })),
          ...analysis.improvements.map((text: string) => ({ text, type: "improvement" as const })),
        ],
        roadmapGoals: analysis.roadmap.map((goal: any) => ({
          title: goal.title || "Развитие навыков",
          description: goal.description || "Продолжайте развиваться",
          timeframe: goal.timeframe || "1-3 месяца",
          resources: Array.isArray(goal.resources) ? goal.resources : ["Онлайн ресурсы", "Практика"],
        })),
        questionFeedback: analysis.questionFeedback || [],
      }

      console.log("analyzeInterviewResponses: Final result object:", result)
      setAnalysisResult(result)
    } catch (error) {
      console.error("Analysis error:", error)
      if (!error) {
        setError("Не удалось проанализировать ответы. Показываем демо результаты.")
      }

      // Fallback к демо результатам
      const interviewData = localStorage.getItem("interview_responses")
      const specialty = localStorage.getItem("interview_specialty") || "frontend"
      const responses = interviewData ? JSON.parse(interviewData) : []
      const demoResult = generateDemoResults(responses, specialty)
      setAnalysisResult(demoResult)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Генерация демо результатов на основе реальных данных
  const generateDemoResults = (responses: any[], specialty: string): AnalysisResult => {
    // Очень мягкий анализ ответов
    const answeredQuestions = responses.filter((r) => r.response && r.duration > 1).length // СНИЗИЛИ до 1 секунды - как в API
    const totalQuestions = responses.length
    const averageDuration = responses.reduce((sum, r) => sum + (r.duration || 0), 0) / totalQuestions
    const shortAnswers = responses.filter((r) => r.duration > 0 && r.duration < 5).length // Снизили порог
    
    // Добавляем недостающие переменные
    const optimalAnswers = responses.filter((r) => r.duration >= 30 && r.duration <= 90).length
    const longAnswers = responses.filter((r) => r.duration > 90).length
    const unansweredQuestions = totalQuestions - answeredQuestions

    // СПРАВЕДЛИВАЯ система оценки (как в API)
    let baseScore = 5

    const answerRate = answeredQuestions / totalQuestions
    
    // Базовая оценка по проценту ответов (точно как в API)
    if (answerRate === 0) {
      baseScore = 2 // 0% ответов = 2 балла
    } else if (answerRate < 0.2) {
      baseScore = 3 // Менее 20% = 3 балла
    } else if (answerRate >= 0.2 && answerRate < 0.4) {
      baseScore = 4 // 20% ответов = 4 балла (средний уровень)
    } else if (answerRate >= 0.4 && answerRate < 0.6) {
      baseScore = 5 // 40% ответов = 5 баллов (хорошо!)
    } else if (answerRate >= 0.6 && answerRate < 0.8) {
      baseScore = 7 // 60% ответов = 7 баллов (отлично!)
    } else {
      baseScore = 9 // 80%+ ответов = 9 баллов (превосходно!)
    }

    // МАКСИМАЛЬНО ЩЕДРЫЕ бонусы за качество (как в API)
    if (answeredQuestions > 0) {
      // Большой бонус просто за то, что есть ответы
      baseScore += 1
      
      if (optimalAnswers > answeredQuestions * 0.1) { // Очень низкий порог - 10%
        baseScore += 2 // Большой бонус
      }
      if (longAnswers > 0) {
        baseScore += 1.5 // Еще больший бонус
      }
      if (averageDuration > 15) { // Очень низкий порог
        baseScore += 1.5 // Большой бонус
      }
      if (averageDuration > 5) { // Бонус даже за очень короткие ответы
        baseScore += 1
      }
    }

    const overallScore = Math.min(10, Math.max(2, baseScore)) // Минимум 2 балла

    // Генерируем questionFeedback сначала
    const questionFeedback = responses.map((response, index) => {
      const answerText = response.response || ""
      const question = response.question || ""
      
      // Анализируем качество ответа по СОДЕРЖАНИЮ, а не по длине (как в API)
      let score = 5 // По умолчанию 5/10 для поверхностных ответов
      let feedback = ""
      let strengths: string[] = []
      let improvements: string[] = []
      
      if (!answerText || answerText === "Не отвечен" || answerText.trim().length === 0) {
        // Нет ответа
        score = 2
        feedback = "Демо-режим: Вопрос не был отвечен. Рекомендуется изучить тему и подготовить ответ."
        strengths = ["Участие в интервью"]
        improvements = ["Изучить основы темы", "Подготовить ответ на вопрос"]
      } else {
        // Анализируем содержание ответа
        const hasKeywords = analyzeAnswerContentInResults(answerText, question, specialty)
        
        if (hasKeywords.isDetailed) {
          // Детальный ответ с техническими терминами и примерами
          score = Math.floor(Math.random() * 2) + 8 // 8-9
          feedback = "Демо-режим: Отличный ответ! Демонстрирует глубокое понимание темы с техническими деталями."
          strengths = ["Глубокое понимание темы", "Использование технических терминов", "Конкретные примеры"]
          improvements = ["Продолжать развивать экспертизу в данной области"]
        } else if (hasKeywords.isGood) {
          // Хороший ответ с пониманием темы
          score = Math.floor(Math.random() * 2) + 6 // 6-7
          feedback = "Демо-режим: Хороший ответ, показывает понимание темы. Можно добавить больше деталей."
          strengths = ["Понимание основных концепций", "Правильное направление мышления"]
          improvements = ["Добавить больше технических деталей", "Привести конкретные примеры"]
        } else if (hasKeywords.isBasic) {
          // Базовый ответ - поверхностный (5/10 как просили)
          score = 5
          feedback = "Демо-режим: ПОВЕРХНОСТНЫЙ ответ - показано базовое понимание, но недостаточно деталей и глубины."
          strengths = ["Базовое понимание темы", "Попытка ответить на вопрос"]
          improvements = ["Углубить знания по теме", "Добавить технические детали", "Привести практические примеры"]
        } else {
          // Слабый ответ
          score = Math.floor(Math.random() * 2) + 3 // 3-4
          feedback = "Демо-режим: Ответ требует улучшения. Необходимо лучше изучить тему."
          strengths = ["Попытка ответить на вопрос"]
          improvements = ["Изучить основы темы", "Подготовить более структурированный ответ"]
        }
      }
      
      return {
        questionId: index + 1,
        questionText: response.question || `Вопрос ${index + 1}`,
        feedback,
        score,
        strengths,
        improvements,
      }
    })

    // Рассчитываем общую оценку на основе оценок по вопросам
    const avgQuestionScore = questionFeedback.length > 0 
      ? questionFeedback.reduce((sum, q) => sum + q.score, 0) / questionFeedback.length
      : overallScore
    
    // Используем среднее между расчетной оценкой и оценками по вопросам
    const finalOverallScore = Math.round(((overallScore + avgQuestionScore) / 2) * 10) / 10

    return {
      overallScore: finalOverallScore,
      criteriaScores: [
        {
          name: "Технические знания",
          score: Math.max(4, overallScore - 0.5 + Math.random() * 1), // Минимум 4, ближе к общей оценке
          maxScore: 10,
          description:
            answeredQuestions > totalQuestions * 0.6
              ? "Хорошие базовые знания, демонстрирует понимание концепций"
              : answeredQuestions > totalQuestions * 0.3
                ? "Базовые знания присутствуют, есть области для развития"
                : "Начальный уровень, требуется изучение основ",
          icon: Code,
        },
        {
          name: "Практический опыт",
          score: Math.max(4, overallScore - 0.3 + Math.random() * 1), // Более щедрая оценка
          maxScore: 10,
          description:
            averageDuration > 40
              ? "Хороший практический опыт, приводит примеры"
              : averageDuration > 15
                ? "Есть практический опыт, можно развивать дальше"
                : "Начальный практический опыт",
          icon: Target,
        },
        {
          name: "Коммуникативные навыки",
          score: Math.max(5, overallScore + 0.5 + Math.random() * 1), // Самая высокая оценка
          maxScore: 10,
          description:
            answeredQuestions > totalQuestions * 0.5
              ? "Хорошие коммуникативные навыки, четко выражает мысли"
              : answeredQuestions > 0
                ? "Базовые коммуникативные навыки, есть потенциал"
                : "Развивающиеся коммуникативные навыки",
          icon: MessageSquare,
        },
        {
          name: "Решение проблем",
          score: Math.max(4, overallScore + Math.random() * 1), // Более мягкая оценка
          maxScore: 10,
          description:
            answeredQuestions > totalQuestions * 0.5
              ? "Хорошие навыки решения задач, логический подход"
              : answeredQuestions > totalQuestions * 0.2
                ? "Базовые навыки решения проблем, есть потенциал"
                : "Развивающиеся навыки решения проблем",
          icon: Lightbulb,
        },
      ],
      feedback: [
        ...(answeredQuestions > totalQuestions * 0.7
          ? [{ text: "Ответил на большинство вопросов", type: "strength" as const }]
          : []),
        ...(averageDuration > 30 ? [{ text: "Развернутые ответы на вопросы", type: "strength" as const }] : []),
        ...(answeredQuestions < totalQuestions * 0.5
          ? [{ text: "Много вопросов остались без ответа - серьезный недостаток", type: "improvement" as const }]
          : []),
        ...(shortAnswers > 0 ? [{ text: "Некоторые ответы были слишком краткими", type: "improvement" as const }] : []),
        ...(averageDuration < 20
          ? [{ text: "Ответы недостаточно подробные для технического интервью", type: "improvement" as const }]
          : []),
        { text: "Необходимо углубить технические знания и больше практиковаться", type: "improvement" as const },
        ...(unansweredQuestions > totalQuestions * 0.3
          ? [{ text: "Критически важно: изучить базовые концепции специальности", type: "improvement" as const }]
          : []),
      ],
      roadmapGoals: [
        {
          title: answeredQuestions < totalQuestions * 0.5 ? "Срочное изучение основ" : "Углубление технических знаний",
          description:
            answeredQuestions < totalQuestions * 0.5
              ? `Критически важно изучить базовые концепции ${specialty} разработки`
              : `Изучение ключевых концепций ${specialty} разработки`,
          timeframe: answeredQuestions < totalQuestions * 0.5 ? "2-3 месяца" : "1-2 месяца",
          resources: ["Официальная документация", "Онлайн курсы", "Практические проекты", "Менторство"],
        },
        {
          title: "Развитие коммуникативных навыков",
          description:
            shortAnswers > 0
              ? "Научиться давать развернутые технические ответы"
              : "Улучшение способности объяснять технические концепции",
          timeframe: "2-3 месяца",
          resources: ["Практика презентаций", "Участие в митапах", "Технические интервью с друзьями"],
        },
      ],
      questionFeedback,
    }
  }

  useEffect(() => {
    analyzeInterviewResponses()
  }, [])

  const handleShare = async () => {
    setIsSharing(true)
    setTimeout(() => {
      setIsSharing(false)
    }, 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400"
    if (score >= 6) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "bg-green-500/20"
    if (score >= 6) return "bg-yellow-500/20"
    return "bg-red-500/20"
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">Анализируем ваши ответы...</h2>
          <p className="text-gray-300">ИИ обрабатывает результаты интервью</p>
        </Card>
      </div>
    )
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Ошибка анализа</h2>
          <p className="text-gray-300 mb-4">{error || "Не удалось проанализировать результаты"}</p>
          <Button onClick={() => (window.location.href = "/")} className="bg-blue-600 hover:bg-blue-700 text-white">
            Вернуться на главную
          </Button>
        </Card>
      </div>
    )
  }

  const { overallScore, criteriaScores, feedback, roadmapGoals } = analysisResult

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Результаты интервью</h1>
          </div>
          <p className="text-gray-300">Анализ выполнен на основе ваших ответов</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Overall Score */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Общая оценка</h2>
              <div className="flex items-center justify-center space-x-8">
                <CircularProgress value={overallScore} size={150} strokeWidth={12} />
                <div className="text-left">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{overallScore.toFixed(1)}/10</div>
                  <div className="text-gray-300 mb-4">
                    {overallScore >= 8
                      ? "Отличный результат!"
                      : overallScore >= 6
                        ? "Хороший результат!"
                        : overallScore >= 4
                          ? "Удовлетворительно"
                          : "Требует улучшения"}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Star className="w-4 h-4 mr-1 text-yellow-400" />
                    Основано на анализе ваших ответов
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Criteria Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {criteriaScores.map((criteria, index) => {
              const IconComponent = criteria.icon
              return (
                <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className="w-6 h-6 text-blue-400" />
                      <Badge className={`${getScoreBgColor(criteria.score)} ${getScoreColor(criteria.score)} border-0`}>
                        {criteria.score.toFixed(1)}/{criteria.maxScore}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-white mb-2">{criteria.name}</h3>
                    <p className="text-sm text-gray-300 mb-3">{criteria.description}</p>
                    <Progress value={(criteria.score / criteria.maxScore) * 100} className="h-2 bg-white/10" />
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Detailed Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strengths */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Сильные стороны
                </CardTitle>
                <CardDescription className="text-gray-300">Ваши преимущества и достижения</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback
                  .filter((item) => item.type === "strength")
                  .map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{item.text}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Области для улучшения
                </CardTitle>
                <CardDescription className="text-gray-300">Рекомендации для развития</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback
                  .filter((item) => item.type === "improvement")
                  .map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{item.text}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Personal Roadmap */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Персональный роадмап развития
              </CardTitle>
              <CardDescription className="text-gray-300">Пошаговый план для достижения ваших целей</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {roadmapGoals.map((goal, index) => (
                <div key={index} className="border-l-4 border-blue-400 pl-6 pb-6 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{goal.title}</h4>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {goal.timeframe}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Рекомендуемые ресурсы:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {goal.resources.map((resource, resourceIndex) => (
                        <Badge key={resourceIndex} variant="secondary" className="bg-white/10 text-gray-300">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Question Feedback */}
          {analysisResult.questionFeedback && analysisResult.questionFeedback.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Обратная связь по вопросам
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Детальный анализ ваших ответов на каждый вопрос
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysisResult.questionFeedback.map((feedback, index) => (
                  <div key={feedback.questionId} className="border-l-2 border-purple-500/30 pl-4 space-y-3">
                    {/* Вопрос и оценка */}
                    <div className="flex items-start justify-between">
                      <h4 className="text-white font-medium text-sm leading-relaxed pr-4">
                        {index + 1}. {feedback.questionText}
                      </h4>
                      <div className="flex items-center space-x-1 bg-purple-500/20 px-2 py-1 rounded-full flex-shrink-0">
                        <Star className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-300 text-xs font-medium">
                          {feedback.score}/10
                        </span>
                      </div>
                    </div>

                    {/* Обратная связь */}
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feedback.feedback}
                    </p>

                    {/* Сильные стороны и улучшения */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Сильные стороны */}
                      {feedback.strengths && feedback.strengths.length > 0 && (
                        <div>
                          <h5 className="text-green-400 text-xs font-medium mb-2 flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Сильные стороны</span>
                          </h5>
                          <ul className="space-y-1">
                            {feedback.strengths.map((strength, idx) => (
                              <li key={idx} className="text-gray-400 text-xs flex items-start space-x-1">
                                <span className="text-green-400 mt-1">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Области для улучшения */}
                      {feedback.improvements && feedback.improvements.length > 0 && (
                        <div>
                          <h5 className="text-orange-400 text-xs font-medium mb-2 flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Можно улучшить</span>
                          </h5>
                          <ul className="space-y-1">
                            {feedback.improvements.map((improvement, idx) => (
                              <li key={idx} className="text-gray-400 text-xs flex items-start space-x-1">
                                <span className="text-orange-400 mt-1">•</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              <Download className="w-4 h-4 mr-2" />
              Скачать отчет PDF
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3"
              onClick={() => (window.location.href = "/")}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Пройти другое интервью
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={isSharing}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3"
            >
              {isSharing ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  Подготовка...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Поделиться результатом
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Нужна помощь?</h2>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto px-4">
              Если у вас возникли проблемы или есть вопросы/предложения, пишите нам в Telegram бот
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  Telegram Bot поддержки
                </h3>
                
                <p className="text-gray-300 mb-2 text-lg font-mono">
                  @careeros_bot
                </p>
                
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Пишите нам в любое время - отвечаем быстро! Поможем с любыми вопросами по платформе.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a 
                    href="https://t.me/careeros_bot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Написать в Telegram
                    </Button>
                  </a>
                  
                  <Button 
                    variant="outline" 
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 px-6 py-3 bg-transparent"
                    onClick={() => window.open('mailto:support@careeros.ru', '_blank')}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Написать на email
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span>Быстрые ответы</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Техническая поддержка</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-green-400" />
                      <span>Предложения и отзывы</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Функция анализа содержания ответа с процентной системой (синхронизировано с API)
function analyzeAnswerContentInResults(answer: string, question: string, specialty: string) {
  const answerLower = answer.toLowerCase()
  const questionLower = question.toLowerCase()
  
  // Технические термины для разных специальностей
  const technicalTerms = {
    frontend: ['react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'html', 'dom', 'api', 'component', 'state', 'props', 'hook', 'redux', 'webpack', 'babel'],
    backend: ['api', 'database', 'sql', 'server', 'microservice', 'rest', 'graphql', 'authentication', 'authorization', 'cache', 'queue', 'docker', 'kubernetes'],
    fullstack: ['frontend', 'backend', 'database', 'api', 'server', 'client', 'architecture', 'deployment', 'scaling'],
    mobile: ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'mobile', 'app', 'native'],
    devops: ['docker', 'kubernetes', 'ci/cd', 'deployment', 'infrastructure', 'monitoring', 'logging', 'scaling', 'cloud'],
    qa: ['testing', 'automation', 'selenium', 'cypress', 'unit test', 'integration', 'bug', 'quality'],
    default: ['код', 'программ', 'разработ', 'технолог', 'алгоритм', 'структур', 'паттерн', 'архитектур']
  }
  
  const relevantTerms = technicalTerms[specialty as keyof typeof technicalTerms] || technicalTerms.default
  
  // Подсчитываем технические термины
  const techTermCount = relevantTerms.filter(term => answerLower.includes(term)).length
  
  // Ищем примеры и конкретику
  const hasExamples = /например|пример|использовал|делал|работал|проект|опыт|практик/i.test(answer)
  const hasDetails = /потому что|так как|поскольку|дело в том|объясн|причин|механизм|принцип/i.test(answer)
  const hasComparison = /отличие|разница|сравнен|лучше|хуже|преимущество|недостаток/i.test(answer)
  const hasStructure = answer.split(/[.!?]/).length > 2 // Структурированный ответ
  
  // Рассчитываем процентную оценку
  let percentage = 0
  
  // Базовые баллы за наличие ответа
  if (answer.length > 10) percentage += 30
  if (answer.length > 50) percentage += 10
  if (answer.length > 100) percentage += 10
  
  // Баллы за технические термины
  percentage += Math.min(techTermCount * 8, 25) // До 25% за термины
  
  // Баллы за примеры и детали
  if (hasExamples) percentage += 15
  if (hasDetails) percentage += 10
  if (hasComparison) percentage += 8
  if (hasStructure) percentage += 7
  
  // Округляем до мотивирующих порогов
  if (percentage >= 85) percentage = 90
  else if (percentage >= 75) percentage = 80
  else if (percentage >= 65) percentage = 70
  else if (percentage >= 55) percentage = 60
  else if (percentage >= 45) percentage = 50
  else if (percentage >= 35) percentage = 40
  else if (percentage >= 25) percentage = 30
  else if (percentage >= 15) percentage = 20
  else if (percentage >= 5) percentage = 10
  
  // Определяем уровни для обратной совместимости
  const isDetailed = percentage >= 80
  const isGood = percentage >= 60
  const isBasic = percentage >= 30
  
  return { 
    isDetailed, 
    isGood, 
    isBasic, 
    percentage,
    techTermCount, 
    hasExamples, 
    hasDetails,
    hasComparison,
    hasStructure
  }
}