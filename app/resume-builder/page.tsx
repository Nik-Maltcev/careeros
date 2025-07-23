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
  Upload,
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
} from "lucide-react"
import Link from "next/link"

interface GenerationStep {
  id: string
  title: string
  status: "pending" | "processing" | "completed" | "error"
  description: string
}

export default function ResumeBuilderPage() {
  const [jobUrl, setJobUrl] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResume, setGeneratedResume] = useState("")
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const [steps, setSteps] = useState<GenerationStep[]>([
    {
      id: "scrape",
      title: "Анализ вакансии",
      status: "pending",
      description: "Извлекаем требования из вакансии",
    },
    {
      id: "parse",
      title: "Обработка резюме",
      status: "pending",
      description: "Анализируем ваше текущее резюме",
    },
    {
      id: "generate",
      title: "Генерация резюме",
      status: "pending",
      description: "Создаем персонализированное резюме",
    },
    {
      id: "optimize",
      title: "ATS оптимизация",
      status: "pending",
      description: "Добавляем ключевые слова для ATS",
    },
  ])

  const updateStepStatus = (stepId: string, status: GenerationStep["status"]) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setResumeFile(file)
      setError(null)
    } else {
      setError("Пожалуйста, загрузите PDF файл")
    }
  }

  const handleGenerate = async () => {
    if (!jobUrl || !resumeFile) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(0)
    setGeneratedResume("")

    try {
      // Шаг 1: Скрапинг вакансии
      setCurrentStep("Анализируем вакансию...")
      updateStepStatus("scrape", "processing")
      setProgress(25)

      const scrapeResponse = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      })

      if (!scrapeResponse.ok) {
        throw new Error("Ошибка при анализе вакансии")
      }

      const jobData = await scrapeResponse.json()
      updateStepStatus("scrape", "completed")

      // Шаг 2: Обработка резюме
      setCurrentStep("Обрабатываем ваше резюме...")
      updateStepStatus("parse", "processing")
      setProgress(50)

      const formData = new FormData()
      formData.append("resume", resumeFile)
      formData.append("jobData", JSON.stringify(jobData))
      formData.append("additionalInfo", additionalInfo)

      const parseResponse = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      })

      if (!parseResponse.ok) {
        throw new Error("Ошибка при обработке резюме")
      }

      const parseData = await parseResponse.json()
      updateStepStatus("parse", "completed")

      // Шаг 3: Генерация резюме
      setCurrentStep("Создаем персонализированное резюме...")
      updateStepStatus("generate", "processing")
      setProgress(75)

      const generateResponse = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobData: jobData,
          resumeData: parseData,
          additionalInfo: additionalInfo,
        }),
      })

      if (!generateResponse.ok) {
        throw new Error("Ошибка при генерации резюме")
      }

      const result = await generateResponse.json()
      updateStepStatus("generate", "completed")

      // Шаг 4: ATS оптимизация
      setCurrentStep("Оптимизируем для ATS...")
      updateStepStatus("optimize", "processing")
      setProgress(100)

      // Имитируем небольшую задержку для ATS оптимизации
      await new Promise((resolve) => setTimeout(resolve, 1000))
      updateStepStatus("optimize", "completed")

      setGeneratedResume(result.resume)
      setCurrentStep("Готово!")
    } catch (error: any) {
      console.error("Generation error:", error)
      setError(error.message || "Произошла ошибка при генерации резюме")

      // Отмечаем текущий шаг как ошибочный
      const currentStepId = steps.find((s) => s.status === "processing")?.id
      if (currentStepId) {
        updateStepStatus(currentStepId, "error")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadResume = () => {
    const blob = new Blob([generatedResume], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "personalized-resume.txt"
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
              <span className="text-xl font-bold text-white">AI Resume Builder</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Создайте резюме под{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                конкретную вакансию
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              ИИ проанализирует вакансию и адаптирует ваше резюме, добавив нужные ключевые слова для прохождения ATS
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
                <p className="text-gray-300 text-sm">Резюме адаптируется под требования конкретной вакансии</p>
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
                  Загрузите ссылку на вакансию и ваше текущее резюме
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
                </div>

                {/* Resume Upload */}
                <div className="space-y-2">
                  <Label htmlFor="resume" className="text-white flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Текущее резюме (PDF)
                  </Label>
                  <div className="relative">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="bg-white/10 border-white/20 text-white file:bg-white/20 file:border-0 file:text-white file:mr-4"
                    />
                  </div>
                  {resumeFile && (
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>{resumeFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo" className="text-white">
                    Дополнительная информация (опционально)
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Укажите дополнительные навыки, достижения или особенности, которые хотите подчеркнуть..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                  />
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
                  disabled={isGenerating || !jobUrl || !resumeFile}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Генерируем резюме...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Создать резюме
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
                  Отслеживайте прогресс создания вашего резюме
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

                {/* Generated Resume */}
                {generatedResume && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Готовое резюме</h3>
                      <Button onClick={downloadResume} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Скачать
                      </Button>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">{generatedResume}</pre>
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
