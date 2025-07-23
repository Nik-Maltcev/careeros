"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LevelSelector } from "@/components/level-selector"
import {
  Home,
  ChevronRight,
  Clock,
  MessageSquare,
  Mic,
  Star,
  Wifi,
  Volume2,
  Languages,
  Play,
  Code,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import type { InterviewLevel } from "@/types/interview"
import { SupabaseAuthService as AuthService } from "@/lib/auth-supabase"
import { AuthDialog } from "@/components/auth-dialog"

function InterviewPrepContent() {
  const searchParams = useSearchParams()
  const specialtyId = searchParams.get("specialty") || "frontend"

  // Маппинг специальностей
  const specialtyMap: Record<string, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
    frontend: { name: "Frontend Developer", icon: Code },
    backend: { name: "Backend Developer", icon: Code },
    devops: { name: "DevOps Engineer", icon: Code },
    "data-scientist": { name: "Data Scientist", icon: Code },
    "product-manager": { name: "Product Manager", icon: Code },
    "ux-ui-designer": { name: "UX/UI Designer", icon: Code },
    marketing: { name: "Marketing Specialist", icon: Code },
    "project-manager": { name: "Project Manager", icon: Code },
    "business-analyst": { name: "Business Analyst", icon: Code },
    "system-analyst": { name: "System Analyst", icon: Code },
    "tech-support": { name: "Technical Support Specialist", icon: Code },
  }

  const specialty = specialtyMap[specialtyId]?.name || "Frontend Developer"
  const SpecialtyIcon = specialtyMap[specialtyId]?.icon || Code

  const [currentStep, setCurrentStep] = useState<"level" | "checklist">("level")
  const [selectedLevel, setSelectedLevel] = useState<InterviewLevel>()
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [limitWarning, setLimitWarning] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [remainingInterviews, setRemainingInterviews] = useState<number>(0)

  useEffect(() => {
    checkLimitsAndUser()
  }, [])

  const checkLimitsAndUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)

      const { canStart, reason, remainingInterviews: remaining } = await AuthService.canStartInterview()

      console.log("Interview check result:", { canStart, reason, remaining })

      if (!canStart) {
        setLimitWarning(reason || "Достигнут лимит интервью")
      } else {
        setLimitWarning(null)
      }

      setRemainingInterviews(remaining || 0)
    } catch (error) {
      console.error("Error checking limits:", error)
    }
  }

  const handleStartInterview = async () => {
    try {
      const { canStart, reason } = await AuthService.canStartInterview()

      console.log("Starting interview check:", { canStart, reason })

      if (canStart) {
        // Записываем использование интервью
        await AuthService.recordInterviewUsage()
        // Navigate to interview page with level
        window.location.href = `/interview?specialty=${specialtyId}&level=${selectedLevel}`
      } else {
        setLimitWarning(reason || "Достигнут лимит интервью")
        if (!user) {
          setIsAuthDialogOpen(true)
        }
      }
    } catch (error) {
      console.error("Error starting interview:", error)
      setLimitWarning("Произошла ошибка при запуске интервью")
    }
  }

  const handleLevelSelect = (level: InterviewLevel) => {
    setSelectedLevel(level)
    setCurrentStep("checklist")
  }

  const handleBackToLevelSelection = () => {
    setCurrentStep("level")
  }

  const handleAuthSuccess = () => {
    setLimitWarning(null)
    // Обновляем данные пользователя и лимиты
    checkLimitsAndUser()
  }

  const getLevelInfo = (level: InterviewLevel) => {
    const levelData = {
      junior: {
        questions: 8,
        duration: "10-15 мин",
        color: "green",
        icon: "🌱",
      },
      middle: {
        questions: 10,
        duration: "15-20 мин",
        color: "yellow",
        icon: "⚡",
      },
      senior: {
        questions: 12,
        duration: "20-25 мин",
        color: "red",
        icon: "🚀",
      },
    }
    return levelData[level]
  }

  const canStart = !limitWarning

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-300 mb-8">
          <Link href="/" className="hover:text-white transition-colors flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Главная
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-blue-400">{specialty}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Подготовка</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                <SpecialtyIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Подготовка к интервью</h1>
            </div>
            <p className="text-xl text-gray-300">
              Специальность: <span className="text-blue-400 font-semibold">{specialty}</span>
            </p>
            {selectedLevel && (
              <div className="mt-4">
                <Badge
                  className={`bg-${getLevelInfo(selectedLevel).color}-500/20 text-${getLevelInfo(selectedLevel).color}-300 border-${getLevelInfo(selectedLevel).color}-400`}
                >
                  {getLevelInfo(selectedLevel).icon} {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}{" "}
                  уровень
                </Badge>
              </div>
            )}

            {/* Limit Warning */}
            {limitWarning && (
              <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <div className="text-left">
                    <p className="text-orange-300 text-sm font-medium">{limitWarning}</p>
                    {!user && (
                      <Button
                        size="sm"
                        onClick={() => setIsAuthDialogOpen(true)}
                        className="mt-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0"
                      >
                        Зарегистрироваться
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Interviews Info */}
            {canStart && remainingInterviews !== undefined && (
              <div className="mt-4">
                <Badge className="bg-green-500/20 text-green-300 border-green-400">
                  {user ? `Осталось ${remainingInterviews} интервью` : `${remainingInterviews} бесплатное интервью`}
                </Badge>
              </div>
            )}
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 ${currentStep === "level" ? "text-blue-400" : selectedLevel ? "text-green-400" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "level" ? "bg-blue-500" : selectedLevel ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  {selectedLevel && currentStep !== "level" ? "✓" : "1"}
                </div>
                <span className="font-medium">Выбор уровня</span>
              </div>
              <div className={`w-8 h-0.5 ${selectedLevel ? "bg-green-400" : "bg-gray-600"}`} />
              <div
                className={`flex items-center space-x-2 ${currentStep === "checklist" ? "text-blue-400" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "checklist" ? "bg-blue-500" : "bg-gray-600"
                  }`}
                >
                  2
                </div>
                <span className="font-medium">Готовность к интервью</span>
              </div>
            </div>
          </div>

          {/* Level Selection Step */}
          {currentStep === "level" && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-8">
                <LevelSelector selectedLevel={selectedLevel} onLevelSelect={handleLevelSelect} specialty={specialty} />
              </CardContent>
            </Card>
          )}

          {/* Checklist Step */}
          {currentStep === "checklist" && selectedLevel && (
            <div className="space-y-8">
              {/* Back Button */}
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  onClick={handleBackToLevelSelection}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Изменить уровень
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Interview Info */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                      Информация об интервью
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-2" />
                        Продолжительность
                      </div>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {getLevelInfo(selectedLevel).duration}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-300">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Количество вопросов
                      </div>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {getLevelInfo(selectedLevel).questions} вопросов
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-300">
                        <Mic className="w-4 h-4 mr-2" />
                        Формат
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        Голосовые ответы
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-300">
                        <Star className="w-4 h-4 mr-2" />
                        Уровень сложности
                      </div>
                      <Badge
                        className={`bg-${getLevelInfo(selectedLevel).color}-500/20 text-${getLevelInfo(selectedLevel).color}-300`}
                      >
                        {getLevelInfo(selectedLevel).icon}{" "}
                        {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Preparation Tips */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                      Рекомендации для подготовки
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Советы для успешного прохождения интервью
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mic className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Проверьте работу микрофона</p>
                        <p className="text-gray-400 text-sm">
                          Убедитесь, что микрофон работает и звук записывается четко
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Wifi className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Стабильное интернет-соединение</p>
                        <p className="text-gray-400 text-sm">Проверьте качество соединения для бесперебойной работы</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Volume2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Тихое место</p>
                        <p className="text-gray-400 text-sm">Найдите спокойное место без посторонних шумов</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Languages className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Готовность к ответам</p>
                        <p className="text-gray-400 text-sm">Будьте готовы отвечать на русском или английском языке</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Start Interview Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleStartInterview}
                  disabled={!canStart}
                  className={`px-12 py-4 text-lg font-semibold ${
                    canStart
                      ? `bg-gradient-to-r from-${getLevelInfo(selectedLevel).color}-600 to-blue-600 hover:from-${getLevelInfo(selectedLevel).color}-700 hover:to-blue-700 text-white border-0 transition-all duration-300`
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {canStart
                    ? `Начать интервью (${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)})`
                    : "Достигнут лимит интервью"}
                </Button>

                <p className="text-gray-400 text-sm mt-3">
                  {canStart ? "Интервью начнется сразу после нажатия кнопки. Убедитесь, что вы готовы!" : limitWarning}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        mode="register"
      />
    </div>
  )
}

export default function InterviewPrepPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <InterviewPrepContent />
    </Suspense>
  )
}
