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
    // Более мягкий анализ ответов
    const answeredQuestions = responses.filter((r) => r.response && r.duration > 5).length // Снизили порог с 10 до 5 секунд
    const totalQuestions = responses.length
    const averageDuration = responses.reduce((sum, r) => sum + (r.duration || 0), 0) / totalQuestions
    const shortAnswers = responses.filter((r) => r.duration > 0 && r.duration < 5).length // Снизили порог

    // БОЛЕЕ МЯГКИЙ расчет оценки - начинаем с 5 баллов (средний уровень)
    let baseScore = 5

    // Бонус за отвеченные вопросы (более щедрый)
    const answerRate = answeredQuestions / totalQuestions
    if (answerRate >= 0.8) baseScore += 2.5  // 80%+ ответов = отличный бонус
    else if (answerRate >= 0.6) baseScore += 2  // 60%+ ответов = хороший бонус
    else if (answerRate >= 0.4) baseScore += 1  // 40%+ ответов = небольшой бонус
    else if (answerRate >= 0.2) baseScore += 0.5  // 20%+ ответов = минимальный бонус

    // Бонус за качество ответов (продолжительность)
    if (averageDuration > 20) baseScore += 1    // 20+ секунд = хорошо
    if (averageDuration > 40) baseScore += 1    // 40+ секунд = отлично
    if (averageDuration > 60) baseScore += 0.5  // 60+ секунд = превосходно

    // Мягкий штраф только за очень короткие ответы
    if (shortAnswers > answeredQuestions * 0.7) {
      baseScore -= 0.5  // Небольшой штраф только если большинство ответов очень короткие
    }

    // Мягкий штраф только если совсем мало ответов
    const unansweredQuestions = totalQuestions - answeredQuestions
    if (unansweredQuestions > totalQuestions * 0.8) {
      baseScore -= 1  // Штраф только если не ответили на 80%+ вопросов
    }

    const overallScore = Math.min(10, Math.max(4, baseScore)) // Минимум 4 балла вместо 1

    return {
      overallScore,
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
      questionFeedback: responses.map((response, index) => ({
        questionId: index + 1,
        questionText: response.question || `Вопрос ${index + 1}`,
        feedback: response.response && response.duration > 5 
          ? "Демо-режим: хороший ответ! Детальный анализ с персональными рекомендациями будет доступен в полной версии."
          : response.response && response.duration > 0
          ? "Демо-режим: ответ получен, но можно развить тему подробнее. Полный анализ доступен в расширенной версии."
          : "Демо-режим: вопрос пропущен. Рекомендуется изучить тему и попробовать ответить.",
        score: response.response && response.duration > 5 
          ? Math.floor(Math.random() * 2) + 7  // 7-8 для хороших ответов
          : response.response && response.duration > 0
          ? Math.floor(Math.random() * 2) + 5  // 5-6 для коротких ответов
          : Math.floor(Math.random() * 2) + 3, // 3-4 для пропущенных
        strengths: response.response && response.duration > 5 
          ? ["Развернутый ответ", "Демонстрирует понимание концепций", "Хорошая структура изложения"]
          : response.response && response.duration > 0
          ? ["Ответ предоставлен", "Показано базовое понимание"]
          : ["Участие в интервью", "Готовность к обучению"],
        improvements: response.response && response.duration > 5
          ? ["Можно добавить больше практических примеров", "Углубить технические детали"]
          : response.response && response.duration > 0
          ? ["Дать более развернутый ответ", "Добавить конкретные примеры"]
          : ["Изучить основы темы", "Подготовить развернутый ответ"],
      })),
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
    </div>
  )
}
