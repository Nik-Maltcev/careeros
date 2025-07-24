"use client"

import type React from "react"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"

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
  const [jobUrl, setJobUrl] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [candidateInfo, setCandidateInfo] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("")
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

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
    if (!jobUrl || !candidateInfo.trim()) {
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
          jobUrl: jobUrl,
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AI Cover Letter Builder</span>
            </div>
          </div>
        </div>
      </header>

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
                {/* Job URL */}
                <div className="space-y-2">
                  <Label htmlFor="jobUrl" className="text-white flex items-center">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Ссылка на вакансию
                  </Label>
                  <Input
                    id="jobUrl"
                    type="url"
                    placeholder="https://hh.ru/vacancy/123456"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <p className="text-gray-400 text-xs">
                    Вставьте ссылку на вакансию с любого сайта (hh.ru, LinkedIn, и др.)
                  </p>
                </div>

                {/* Job Description (Recommended) */}
                <div className="space-y-2">
                  <Label htmlFor="jobDescription" className="text-white flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Описание вакансии 
                    <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded border border-orange-500/30">
                      Рекомендуется
                    </span>
                  </Label>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-2">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="text-orange-200 text-sm">
                        <p className="font-medium mb-1">Для лучшего результата:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Откройте ссылку на вакансию</li>
                          <li>Скопируйте полное описание, требования и обязанности</li>
                          <li>Вставьте в поле ниже</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  <Textarea
                    id="jobDescription"
                    placeholder="Вставьте сюда полное описание вакансии, включая:
- Название компании и должности
- Требования к кандидату
- Обязанности
- Условия работы
- Информацию о компании

Чем подробнее описание, тем лучше будет сопроводительное письмо!"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[120px]"
                  />
                  <p className="text-gray-400 text-xs">
                    💡 Без описания вакансии письмо будет общим и менее эффективным
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
                  disabled={isGenerating || !jobUrl || !candidateInfo.trim()}
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
    </div>
  )
}
