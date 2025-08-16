"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  LinkIcon,
  FileText,
  Sparkles,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Brain,
  Target,
  Zap,
  Mail,
  Building,
  User,
  Search,
  LogIn,
  LogOut,
  Crown,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { SupabaseAuthService } from "@/lib/auth-supabase"
import { AuthDialog } from "@/components/auth-dialog"
import { PricingDialog } from "@/components/pricing-dialog"
import { isSupabaseConfigured, type Profile } from "@/lib/supabase"
import { InterviewManager } from "@/lib/interview-manager"
import { VpnWarning, VpnWarningMobile } from "@/components/vpn-warning"

interface GenerationStep {
  id: string
  title: string
  status: "pending" | "processing" | "completed" | "error"
  description: string
}

interface JobData {
  company_name?: string
  job_title?: string
  job_description?: string
  location?: string
}

export default function CoverLetterBuilderPage() {
  const [jobDescription, setJobDescription] = useState("")
  const [candidateInfo, setCandidateInfo] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("")
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  
  // Состояние для авторизации
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showPricingDialog, setShowPricingDialog] = useState(false)
  const [remainingInterviews, setRemainingInterviews] = useState(3)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const initializeUser = async () => {
      try {
        if (isSupabaseConfigured) {
          const user = await SupabaseAuthService.getCurrentUser()
          setCurrentUser(user)
        }
        
        // Загружаем реальное количество интервью
        const remaining = await InterviewManager.getRemainingInterviews()
        console.log('Remaining interviews:', remaining)
        setRemainingInterviews(remaining)
        
      } catch (error) {
        console.error('Error initializing user:', error)
        setCurrentUser(null)
      }
    }

    initializeUser()
    
    if (isSupabaseConfigured) {
      // Подписываемся на изменения авторизации
      try {
        const { data: { subscription } } = SupabaseAuthService.onAuthStateChange(async (user) => {
          console.log('Auth state changed on resume builder:', user)
          if (user) {
            const profile = await SupabaseAuthService.getCurrentUser()
            setCurrentUser(profile)
          } else {
            setCurrentUser(null)
          }
          
          // Обновляем количество интервью при изменении пользователя
          const remaining = await InterviewManager.getRemainingInterviews()
          console.log('Updated remaining interviews:', remaining)
          setRemainingInterviews(remaining)
        })
        
        return () => {
          subscription?.unsubscribe()
        }
      } catch (error) {
        console.error('Error setting up auth listener:', error)
      }
    }
  }, [])

  const [steps, setSteps] = useState<GenerationStep[]>([
    {
      id: "extract",
      title: "Анализ вакансии",
      status: "pending",
      description: "Извлекаем данные о вакансии через Firecrawl",
    },
    {
      id: "generate",
      title: "Генерация письма",
      status: "pending",
      description: "Создаем персонализированное сопроводительное письмо",
    },
  ])

  const updateStepStatus = (stepId: string, status: GenerationStep["status"]) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  const handleGenerate = async () => {
    if (!jobDescription.trim() || !candidateInfo.trim()) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(0)
    setGeneratedCoverLetter("")
    setJobData(null)

    try {
      // Шаг 1: Извлечение данных о вакансии
      setCurrentStep("Анализируем вакансию...")
      updateStepStatus("extract", "processing")
      setProgress(50)

      // Шаг 2: Генерация сопроводительного письма
      setCurrentStep("Создаем сопроводительное письмо...")
      updateStepStatus("generate", "processing")
      setProgress(75)

      const generateResponse = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription,
          candidateInfo: candidateInfo,
        }),
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.error || "Ошибка при генерации сопроводительного письма")
      }

      const result = await generateResponse.json()
      
      updateStepStatus("extract", "completed")
      updateStepStatus("generate", "completed")
      setProgress(100)

      setGeneratedCoverLetter(result.coverLetter)
      setJobData(result.jobData)
      setCurrentStep("Готово!")
    } catch (error: any) {
      console.error("Generation error:", error)
      setError(error.message || "Произошла ошибка при генерации сопроводительного письма")

      // Отмечаем текущий шаг как ошибочный
      const currentStepId = steps.find((s) => s.status === "processing")?.id
      if (currentStepId) {
        updateStepStatus(currentStepId, "error")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCoverLetter = () => {
    const blob = new Blob([generatedCoverLetter], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cover-letter.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-4 py-3">
          {/* Мобильная версия */}
          <div className="flex md:hidden items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">CareerOS</span>
              <VpnWarningMobile />
            </div>
            
            {/* Мобильные кнопки - только самое важное */}
            <div className="flex items-center">
              {isClient && currentUser ? (
                <div className="flex items-center space-x-1">
                  <Link href="/profile" className="text-gray-400 hover:text-gray-300 transition-colors text-xs px-2 py-1">
                    Личный кабинет
                  </Link>
                  {currentUser.plan === 'premium' ? (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400 text-xs px-2 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs px-2 py-1">
                      {remainingInterviews} интервью
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => SupabaseAuthService.logout()}
                    className="text-gray-300 hover:text-white p-1 h-7 w-7 ml-1"
                  >
                    <LogOut className="w-3 h-3" />
                  </Button>
                </div>
              ) : isClient ? (
                <div className="flex items-center space-x-1">
                  <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs px-2 py-1">
                    {remainingInterviews === 1 ? '1 бесплатное интервью' : `${remainingInterviews} бесплатных интервью`}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAuthDialog(true)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs px-2 py-1 h-7"
                  >
                    <LogIn className="w-3 h-3 mr-1" />
                    Войти
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Десктопная версия */}
          <div className="hidden md:flex items-center justify-between py-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CareerOS</span>
            </div>

            {/* Навигационное меню */}
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-white hover:text-blue-300 transition-colors">
                Интервью
              </Link>
              <Link href="/resume-builder" className="text-blue-300 font-medium">
                Сопроводительное письмо
              </Link>
              <Link href="/jobs" className="text-white hover:text-blue-300 transition-colors">
                Найти вакансии
              </Link>
            </nav>

            <div className="flex items-center space-x-2 md:space-x-4">
              <VpnWarning variant="header" />
              {isClient && currentUser ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-blue-500/20 border-blue-400 text-blue-300 hover:bg-blue-500/30 text-xs md:text-sm px-2 py-1"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Личный кабинет
                    </Button>
                  </Link>
                  {currentUser.plan === 'premium' ? (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400 text-xs md:text-sm px-2 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs md:text-sm px-2 py-1">
                      {remainingInterviews} интервью
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => SupabaseAuthService.logout()}
                    className="text-gray-300 hover:text-white p-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : isClient ? (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs md:text-sm px-2 py-1">
                    {remainingInterviews === 1 ? '1 бесплатное интервью' : `${remainingInterviews} бесплатных интервью`}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAuthDialog(true)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs md:text-sm"
                  >
                    <LogIn className="w-3 h-3 mr-1" />
                    Войти
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowPricingDialog(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs md:text-sm"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Купить
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Page Title Section */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center">
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mr-2 md:mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Сопроводительное письмо</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            ИИ проанализирует вакансию и создаст персонализированное сопроводительное письмо
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Создайте{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                сопроводительное письмо
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              ИИ проанализирует вакансию и создаст персонализированное сопроводительное письмо, которое поможет получить интервью
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Точное соответствие</h3>
                <p className="text-gray-300 text-sm">Письмо адаптируется под требования конкретной вакансии</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">ATS оптимизация</h3>
                <p className="text-gray-300 text-sm">Ключевые слова для прохождения автоматических фильтров</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">ИИ анализ</h3>
                <p className="text-gray-300 text-sm">Умный анализ требований и автоматическая адаптация</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Данные для генерации
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Укажите ссылку на вакансию и информацию о себе
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Description (Required) */}
                <div className="space-y-2">
                  <Label htmlFor="jobDescription" className="text-white flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Описание вакансии
                    <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/30">
                      Обязательно
                    </span>
                  </Label>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-blue-200 text-sm">
                        <p className="font-medium mb-1">Как получить описание вакансии:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Найдите интересную вакансию на hh.ru, LinkedIn или другом сайте</li>
                          <li>Скопируйте полное описание вакансии</li>
                          <li>Вставьте в поле ниже</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  <Textarea
                    id="jobDescription"
                    placeholder="Пример: 
Компания: ООО 'Технологии будущего'
Должность: Frontend разработчик
Требования:
- Опыт работы с React от 2 лет
- Знание TypeScript, HTML, CSS
- Опыт работы с REST API
Обязанности:
- Разработка пользовательских интерфейсов
- Оптимизация производительности
- Работа в команде разработки"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[150px]"
                    required
                  />
                  <p className="text-blue-400 text-xs">
                    💡 Скопируйте описание с hh.ru, LinkedIn или любого другого сайта с вакансиями
                  </p>
                </div>

                {/* Candidate Info */}
                <div className="space-y-2">
                  <Label htmlFor="candidateInfo" className="text-white flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Информация о себе
                  </Label>
                  <Textarea
                    id="candidateInfo"
                    placeholder="Расскажите о своем опыте, навыках, достижениях и мотивации. Например:
- Опыт работы и ключевые проекты
- Технические навыки и компетенции  
- Образование и сертификаты
- Достижения и результаты
- Почему вас интересует эта сфера"
                    value={candidateInfo}
                    onChange={(e) => setCandidateInfo(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[150px]"
                    required
                  />
                  <p className="text-gray-400 text-xs">
                    Чем подробнее информация, тем лучше будет сопроводительное письмо
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !jobDescription.trim() || !candidateInfo.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Создаем письмо...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Создать сопроводительное письмо
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Progress and Result */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Процесс генерации
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Отслеживайте прогресс создания сопроводительного письма
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{currentStep}</span>
                      <span className="text-gray-300">{progress}%</span>
                    </div>
                    <Progress value={progress} className="bg-white/10" />
                  </div>
                )}

                {/* Steps */}
                <div className="space-y-3">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {step.status === "completed" && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {step.status === "processing" && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                        {step.status === "error" && <AlertCircle className="w-5 h-5 text-red-400" />}
                        {step.status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{step.title}</div>
                        <div className="text-gray-400 text-sm">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generated Cover Letter */}
                {generatedCoverLetter && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Сопроводительное письмо</h3>
                      <Button onClick={downloadCoverLetter} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Скачать
                      </Button>
                    </div>
                    {jobData && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-300 font-medium">Информация о вакансии</span>
                        </div>
                        <div className="text-sm text-gray-300 space-y-1">
                          {jobData.company_name && <p><strong>Компания:</strong> {jobData.company_name}</p>}
                          {jobData.job_title && <p><strong>Должность:</strong> {jobData.job_title}</p>}
                          {jobData.location && <p><strong>Местоположение:</strong> {jobData.location}</p>}
                        </div>
                      </div>
                    )}
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap">{generatedCoverLetter}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  <Mail className="w-8 h-8 text-white" />
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
                      <Mail className="w-5 h-5 mr-2" />
                      Написать в Telegram
                    </Button>
                  </a>
                  
                  <Button 
                    variant="outline" 
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 px-6 py-3 bg-transparent"
                    onClick={() => window.open('mailto:support@careeros.ru', '_blank')}
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Написать на email
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Быстрые ответы</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Техническая поддержка</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span>Предложения и отзывы</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CareerOS</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Платформа для подготовки к техническим собеседованиям с использованием ИИ
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">
                Интервью
              </Link>
              <Link href="/resume-builder" className="hover:text-white transition-colors">
                Сопроводительное письмо
              </Link>
              <Link href="/jobs" className="hover:text-white transition-colors">
                Найти вакансии
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-500 text-xs">
                © 2024 CareerOS. Все права защищены.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Диалоги */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
      
      <PricingDialog 
        open={showPricingDialog} 
        onOpenChange={setShowPricingDialog}
      />
    </div>
  )
}
