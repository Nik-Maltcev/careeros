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
  Crown,
  LogIn,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import type { InterviewLevel } from "@/types/interview"
import { VpnWarning, VpnWarningMobile } from "@/components/vpn-warning"
import { InterviewManager } from "@/lib/interview-manager"
import { SupabaseAuthService } from "@/lib/auth-supabase"
import { AuthDialog } from "@/components/auth-dialog"
import { PricingDialog } from "@/components/pricing-dialog"

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
  const [limitWarning, setLimitWarning] = useState<string | null>(null)
  const [remainingInterviews, setRemainingInterviews] = useState<number>(3)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showPricingDialog, setShowPricingDialog] = useState(false)

  useEffect(() => {
    checkLimits()
  }, [])

  const checkLimits = async () => {
    const { canStart, reason, remainingInterviews: remaining } = await InterviewManager.canStartInterview()

    if (!canStart) {
      setLimitWarning(reason || "Достигнут лимит интервью")
    } else {
      setLimitWarning(null)
    }

    setRemainingInterviews(remaining)
  }

  const handleStartInterview = async () => {
    const { canStart, reason } = await InterviewManager.canStartInterview()

    if (canStart) {
      // НЕ записываем использование здесь - это будет сделано на странице interview
      // Navigate to interview page with level
      window.location.href = `/interview?specialty=${specialtyId}&level=${selectedLevel}`
    } else {
      // Проверяем, авторизован ли пользователь
      const user = await SupabaseAuthService.getCurrentUser()
      
      if (user) {
        // Пользователь авторизован, но интервью закончились - показываем тарифы
        setShowPricingDialog(true)
      } else {
        // Пользователь не авторизован - показываем авторизацию
        setShowAuthDialog(true)
      }
    }
  }

  const handleLevelSelect = (level: InterviewLevel) => {
    setSelectedLevel(level)
    setCurrentStep("checklist")
  }

  const handleBackToLevelSelection = () => {
    setCurrentStep("level")
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Главная
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-blue-400">{specialty}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Подготовка</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                <SpecialtyIcon className="w-6 h-6 text-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Подготовка к интервью</h1>
            </div>
            <p className="text-xl text-muted-foreground">
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


            {/* Remaining Interviews Info */}
            {canStart && remainingInterviews !== undefined && (
              <div className="mt-4">
                <Badge className="bg-emerald-50 text-emerald-500 border-green-400">
                  {remainingInterviews === 1 ? '1 бесплатное интервью осталось' : `${remainingInterviews} интервью осталось`}
                </Badge>
              </div>
            )}
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 ${currentStep === "level" ? "text-blue-400" : selectedLevel ? "text-emerald-600" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "level" ? "bg-blue-500" : selectedLevel ? "bg-green-500" : "bg-gray-600"
                    }`}
                >
                  {selectedLevel && currentStep !== "level" ? "✓" : "1"}
                </div>
                <span className="font-medium">Выбор уровня</span>
              </div>
              <div className={`w-8 h-0.5 ${selectedLevel ? "bg-green-400" : "bg-gray-600"}`} />
              <div
                className={`flex items-center space-x-2 ${currentStep === "checklist" ? "text-blue-400" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "checklist" ? "bg-blue-500" : "bg-gray-600"
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
            <Card className="bg-white/90 border-border/60 backdrop-blur-sm">
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
                  className="bg-white/70 text-foreground border-border/50 hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Изменить уровень
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Interview Info */}
                <Card className="bg-white/90 border-border/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                      Информация об интервью
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        Продолжительность
                      </div>
                      <Badge variant="secondary" className="bg-sky-50 text-sky-600">
                        {getLevelInfo(selectedLevel).duration}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Количество вопросов
                      </div>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {getLevelInfo(selectedLevel).questions} вопросов
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground">
                        <Mic className="w-4 h-4 mr-2" />
                        Формат
                      </div>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-500">
                        Голосовые ответы
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground">
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
                <Card className="bg-white/90 border-border/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                      Рекомендации для подготовки
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Советы для успешного прохождения интервью
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mic className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-foreground font-medium text-sm">Проверьте работу микрофона</p>
                        <p className="text-muted-foreground text-sm">
                          Убедитесь, что микрофон работает и звук записывается четко
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Wifi className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-foreground font-medium text-sm">Стабильное интернет-соединение</p>
                        <p className="text-muted-foreground text-sm">Проверьте качество соединения для бесперебойной работы</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Volume2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-foreground font-medium text-sm">Тихое место</p>
                        <p className="text-muted-foreground text-sm">Найдите спокойное место без посторонних шумов</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Languages className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-foreground font-medium text-sm">Готовность к ответам</p>
                        <p className="text-muted-foreground text-sm">Будьте готовы отвечать на русском или английском языке</p>
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
                  className={`px-12 py-4 text-lg font-semibold ${canStart
                    ? `bg-gradient-to-r from-${getLevelInfo(selectedLevel).color}-600 to-blue-600 hover:from-${getLevelInfo(selectedLevel).color}-700 hover:to-blue-700 text-foreground border-0 transition-all duration-300`
                    : "bg-gray-600 text-muted-foreground cursor-not-allowed"
                    }`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {canStart
                    ? `Начать интервью (${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)})`
                    : "Достигнут лимит интервью"}
                </Button>

                <p className="text-muted-foreground text-sm mt-3">
                  {canStart ? "Интервью начнется сразу после нажатия кнопки. Убедитесь, что вы готовы!" : limitWarning}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">Нужна помощь?</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
              Если у вас возникли проблемы или есть вопросы/предложения, пишите нам в Telegram бот
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-sky-200 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-foreground" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  Telegram Bot поддержки
                </h3>
                
                <p className="text-muted-foreground mb-2 text-lg font-mono">
                  @careeros_bot
                </p>
                
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Пишите нам в любое время - отвечаем быстро! Поможем с любыми вопросами по платформе.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a 
                    href="https://t.me/careeros_bot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-blue-500 hover:bg-primary text-foreground px-6 py-3">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Написать в Telegram
                    </Button>
                  </a>
                  
                  <Button 
                    variant="outline" 
                    className="border-blue-500/50 text-sky-600 hover:bg-sky-50 hover:border-blue-400 px-6 py-3 bg-transparent"
                    onClick={() => window.open('mailto:support@careeros.ru', '_blank')}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Написать на email
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border/60">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Быстрые ответы</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Техническая поддержка</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-emerald-600" />
                      <span>Предложения и отзывы</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        showLimitMessage={true}
      />

      {/* Pricing Dialog */}
      <PricingDialog open={showPricingDialog} onOpenChange={setShowPricingDialog} />
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
