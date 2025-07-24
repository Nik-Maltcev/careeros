"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AudioRecorder } from "@/components/audio-recorder"
import { InterviewManager } from "@/lib/interview-manager"
import {
  Play,
  Pause,
  SkipForward,
  VolumeX,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Speaker,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react"

interface Question {
  id: number
  text: string
  category: string
  difficulty: "junior" | "middle" | "senior"
}

interface InterviewState {
  questions: Question[]
  currentQuestionIndex: number
  responses: Array<{ response: string; duration: number }>
  isRecording: boolean
  isPlaying: boolean
  audioUrl: string | null
  timeRemaining: number
  isCompleted: boolean
  hasRecordedCurrentQuestion: boolean
  resetTrigger: number
}

// Функция для определения мобильного устройства
const isMobileDevice = () => {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Функция для безопасного преобразования в число
const safeNumber = (value: any, defaultValue = 0): number => {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

export default function InterviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const specialty = searchParams.get("specialty") || "frontend"
  const level = searchParams.get("level") || "middle"

  const [interviewState, setInterviewState] = useState<InterviewState>({
    questions: [],
    currentQuestionIndex: 0,
    responses: [],
    isRecording: false,
    isPlaying: false,
    audioUrl: null,
    timeRemaining: 300, // 5 минут на вопрос
    isCompleted: false,
    hasRecordedCurrentQuestion: false,
    resetTrigger: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [audioPlaybackFailed, setAudioPlaybackFailed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [apiStatus, setApiStatus] = useState<{
    perplexity: boolean
    openai: boolean
    isDemoMode: boolean
  }>({
    perplexity: false,
    openai: false,
    isDemoMode: false,
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Определяем мобильное устройство
  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  // Инициализация интервью
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        console.log("🚀 Starting interview initialization...")
        setIsLoading(true)
        setError(null)
        setDebugInfo("Инициализация...")

        setDebugInfo("Проверка лимитов...")

        // Проверяем лимиты
        const { canStart, reason } = InterviewManager.canStartInterview()
        console.log("Interview limits check:", { canStart, reason })

        if (!canStart) {
          setError(reason || "Достигнут лимит интервью")
          setIsLoading(false)
          return
        }

        setDebugInfo("Генерация вопросов через Perplexity API...")

        // Генерируем вопросы через Perplexity API
        let questions: Question[] = []
        let questionsApiSuccess = false

        try {
          console.log("🔄 Generating questions via Perplexity API...")

          const response = await fetch("/api/generate-questions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              specialty,
              level,
            }),
          })

          console.log("Questions API response status:", response.status)

          if (response.ok) {
            const data = await response.json()
            console.log("Questions API response:", data)

            if (data.questions && Array.isArray(data.questions) && data.questions.length >= 10) {
              questions = data.questions
              questionsApiSuccess = !data.isDemoMode
              console.log(`✅ Successfully got ${questions.length} questions from ${data.source}`)

              setApiStatus((prev) => ({
                ...prev,
                perplexity: questionsApiSuccess,
                isDemoMode: data.isDemoMode,
              }))

              if (questionsApiSuccess) {
                setDebugInfo(`Получено ${questions.length} вопросов через Perplexity API (${data.modelUsed})`)
              } else {
                setDebugInfo(`Используются демо вопросы (${data.fallbackReason})`)
              }
            } else {
              throw new Error("Недостаточно вопросов от API")
            }
          } else {
            const errorData = await response.json().catch(() => ({ error: "Unknown API error" }))
            throw new Error(errorData.error || `API Error: ${response.status}`)
          }
        } catch (apiError) {
          console.error("❌ Questions API failed:", apiError)
          setError(`Ошибка генерации вопросов: ${apiError}`)
          setIsLoading(false)
          return
        }

        if (questions.length < 10) {
          setError("Не удалось получить достаточное количество вопросов (минимум 10)")
          setIsLoading(false)
          return
        }

        console.log("📝 Final questions:", questions.length)

        setInterviewState((prev) => ({
          ...prev,
          questions: questions,
          responses: new Array(questions.length).fill({ response: "", duration: 0 }),
        }))

        setDebugInfo("Запись использования интервью...")

        // Записываем использование интервью
        InterviewManager.recordInterviewUsage()
        console.log("✅ Interview usage recorded")

        setDebugInfo("Генерация аудио...")

        // Генерируем аудио для первого вопроса (не критично)
        if (questions.length > 0) {
          try {
            await generateQuestionAudio(questions[0].text)
            setApiStatus((prev) => ({ ...prev, openai: true }))
          } catch (audioError) {
            console.warn("Audio generation failed:", audioError)
            setAudioPlaybackFailed(true)
            setApiStatus((prev) => ({ ...prev, openai: false }))
            // Не критично, продолжаем без аудио
          }
        }

        setDebugInfo("Готово!")
        console.log("🎉 Interview initialization completed successfully")
      } catch (error: any) {
        console.error("💥 Interview initialization error:", error)
        setError(error.message || "Ошибка инициализации интервью")
        setDebugInfo(`Ошибка: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    initializeInterview()
  }, [specialty, level])

  // Убираем таймер - пользователь сам контролирует темп интервью

  // Генерация аудио для вопроса
  const generateQuestionAudio = async (questionText: string) => {
    try {
      setIsAudioLoading(true)
      setAudioPlaybackFailed(false)

      console.log("🔊 Generating TTS for question...")

      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: questionText,
        }),
      })

      console.log("TTS API response status:", response.status)

      if (!response.ok) {
        console.warn(`TTS API Error: ${response.status}. TTS будет отключен.`)
        setAudioPlaybackFailed(true)
        setApiStatus((prev) => ({ ...prev, openai: false }))
        return
      }

      const audioBlob = await response.blob()

      if (audioBlob.size === 0) {
        throw new Error("Empty audio response")
      }

      const audioUrl = URL.createObjectURL(audioBlob)

      // Создаем новый аудио элемент
      const audio = new Audio(audioUrl)

      // Настройки для мобильных устройств
      if (isMobile) {
        audio.setAttribute("playsinline", "true")
        audio.setAttribute("webkit-playsinline", "true")
        audio.preload = "auto"
        audio.crossOrigin = "anonymous"
      }

      // Обработчики событий
      audio.addEventListener("canplaythrough", () => {
        console.log("✅ Audio ready to play")
        setIsAudioLoading(false)
      })

      audio.addEventListener("error", (e) => {
        console.error("❌ Audio error:", e)
        setAudioPlaybackFailed(true)
        setIsAudioLoading(false)
      })

      audio.addEventListener("ended", () => {
        setInterviewState((prev) => ({ ...prev, isPlaying: false }))
      })

      setCurrentAudio(audio)
      audioRef.current = audio

      // Пытаемся автоматически воспроизвести (может не сработать на мобильных)
      try {
        // Сначала загружаем аудио
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true })
          audio.addEventListener('error', reject, { once: true })
          audio.load()
        })

        const playPromise = audio.play()
        if (playPromise !== undefined) {
          await playPromise
          setInterviewState((prev) => ({ ...prev, isPlaying: true }))
          setAutoplayBlocked(false)
          setAudioPlaybackFailed(false)
          console.log("✅ Audio autoplay successful")
        }
      } catch (autoplayError) {
        console.log("⚠️ Autoplay blocked or failed:", autoplayError)
        setAutoplayBlocked(true)
        setAudioPlaybackFailed(true)
        setInterviewState((prev) => ({ ...prev, isPlaying: false }))
      }
    } catch (error) {
      console.error("❌ Speech generation error:", error)
      setAudioPlaybackFailed(true)
      setIsAudioLoading(false)
    }
  }

  // Воспроизведение/пауза аудио
  const toggleAudioPlayback = useCallback(async () => {
    if (!currentAudio) return

    try {
      if (interviewState.isPlaying) {
        currentAudio.pause()
        setInterviewState((prev) => ({ ...prev, isPlaying: false }))
      } else {
        await currentAudio.play()
        setInterviewState((prev) => ({ ...prev, isPlaying: true }))
        setAutoplayBlocked(false)
        setAudioPlaybackFailed(false)
      }
    } catch (error) {
      console.error("Audio playback error:", error)
      setAudioPlaybackFailed(true)
    }
  }, [currentAudio, interviewState.isPlaying])

  // Переход к следующему вопросу
  const handleNextQuestion = useCallback(async () => {
    const nextIndex = interviewState.currentQuestionIndex + 1

    // Останавливаем текущее аудио
    if (currentAudio) {
      currentAudio.pause()
      setInterviewState((prev) => ({ ...prev, isPlaying: false }))
    }

    if (nextIndex >= interviewState.questions.length) {
      // Завершаем интервью
      setInterviewState((prev) => ({ ...prev, isCompleted: true }))

      // Сохраняем результаты и переходим к анализу
      const responsesForAnalysis = interviewState.responses.map((resp, index) => ({
        question: interviewState.questions[index]?.text || "",
        response: resp.response || "",
        duration: resp.duration || 0,
      }))

      // Сохраняем в localStorage для страницы результатов
      localStorage.setItem("interview_responses", JSON.stringify(responsesForAnalysis))
      localStorage.setItem("interview_specialty", specialty)

      try {
        InterviewManager.saveInterviewResult({
          specialty,
          level,
          overall_score: 0, // Будет рассчитан на странице результатов
          questions_count: interviewState.questions.length,
          analysis_data: {
            specialty,
            level,
            questions: interviewState.questions,
            responses: responsesForAnalysis,
          },
        })
      } catch (error) {
        console.error("Error saving interview result:", error)
      }

      // Переходим к результатам
      router.push("/interview-results")
      return
    }

    // Переходим к следующему вопросу
    setInterviewState((prev) => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      timeRemaining: 300, // Сбрасываем таймер
      hasRecordedCurrentQuestion: false, // Сбрасываем флаг записи
      resetTrigger: prev.resetTrigger + 1, // Увеличиваем триггер для сброса AudioRecorder
    }))

    // Генерируем аудио для следующего вопроса
    const nextQuestion = interviewState.questions[nextIndex]
    if (nextQuestion) {
      try {
        await generateQuestionAudio(nextQuestion.text)
      } catch (error) {
        console.warn("Failed to generate audio for next question:", error)
      }
    }
  }, [interviewState, currentAudio, specialty, level, router])

  // Обработка записи ответа
  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    console.log("🎤 Processing recorded answer...")
    
    // Сначала сохраняем временный ответ
    const updatedResponses = [...interviewState.responses]
    updatedResponses[interviewState.currentQuestionIndex] = {
      response: "Обрабатываем аудио ответ...",
      duration: duration,
    }

    setInterviewState((prev) => ({
      ...prev,
      responses: updatedResponses,
      hasRecordedCurrentQuestion: true,
    }))

    // Пытаемся транскрибировать аудио в текст
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "answer.webm")

      const transcribeResponse = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      })

      const transcribeResult = await transcribeResponse.json()

      if (transcribeResult.success && transcribeResult.transcription) {
        // Обновляем ответ с транскрипцией
        const finalResponses = [...interviewState.responses]
        finalResponses[interviewState.currentQuestionIndex] = {
          response: transcribeResult.transcription,
          duration: duration,
        }

        setInterviewState((prev) => ({
          ...prev,
          responses: finalResponses,
        }))

        console.log("✅ Audio transcribed successfully:", transcribeResult.transcription.substring(0, 100))
      } else {
        // Fallback если транскрипция не удалась
        const fallbackResponses = [...interviewState.responses]
        fallbackResponses[interviewState.currentQuestionIndex] = {
          response: transcribeResult.fallback || `Аудио ответ (${audioBlob.size} bytes)`,
          duration: duration,
        }

        setInterviewState((prev) => ({
          ...prev,
          responses: fallbackResponses,
        }))

        console.warn("⚠️ Transcription failed, using fallback")
      }
    } catch (error) {
      console.error("❌ Transcription error:", error)
      
      // Fallback при ошибке
      const errorResponses = [...interviewState.responses]
      errorResponses[interviewState.currentQuestionIndex] = {
        response: `Аудио ответ (${audioBlob.size} bytes)`,
        duration: duration,
      }

      setInterviewState((prev) => ({
        ...prev,
        responses: errorResponses,
      }))
    }
  }

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(safeNumber(seconds) / 60)
    const secs = safeNumber(seconds) % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Подготавливаем интервью...</p>
          <p className="text-gray-400 text-sm mt-2">{debugInfo}</p>
          <div className="mt-4 text-xs text-gray-500 max-w-md">
            <p>Specialty: {specialty}</p>
            <p>Level: {level}</p>
            <p>Используется модель Sonar Pro от Perplexity AI</p>
            <p className="text-green-400 mt-2">✅ API ключи настроены автоматически</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-red-500/10 border-red-500/20 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Ошибка</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="text-xs text-gray-400 mb-4">
              <p>Debug: {debugInfo}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Попробовать снова
              </Button>
              <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex]
  const progress = ((interviewState.currentQuestionIndex + 1) / interviewState.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">AI Interview</h1>
              <p className="text-sm text-gray-400 capitalize">
                {specialty} • {level}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* API Status */}
            <div className="flex items-center space-x-2">
              <Badge
                className={`text-xs ${apiStatus.perplexity ? "bg-green-500/20 text-green-300 border-green-400" : "bg-red-500/20 text-red-300 border-red-400"}`}
              >
                {apiStatus.perplexity ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                Perplexity
              </Badge>
              <Badge
                className={`text-xs ${apiStatus.openai ? "bg-green-500/20 text-green-300 border-green-400" : "bg-orange-500/20 text-orange-300 border-orange-400"}`}
              >
                {apiStatus.openai ? <Speaker className="w-3 h-3 mr-1" /> : <VolumeX className="w-3 h-3 mr-1" />}
                OpenAI TTS
              </Badge>
            </div>

            {isMobile && (
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400 text-xs">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile
              </Badge>
            )}


          </div>
        </div>

        {/* API Status Info */}
        {apiStatus.isDemoMode && (
          <Card className="bg-orange-500/10 border-orange-500/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="text-orange-300 font-medium text-sm">Демо режим</h3>
                  <p className="text-orange-200 text-xs">
                    Используются предустановленные вопросы. Perplexity API недоступен.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">
              Вопрос {interviewState.currentQuestionIndex + 1} из {interviewState.questions.length}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">{Math.round(progress)}%</span>
              {!apiStatus.isDemoMode && (
                <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Perplexity AI
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg md:text-xl">{currentQuestion?.text}</CardTitle>

              {/* Audio Controls */}
              <div className="flex items-center space-x-2">
                {audioPlaybackFailed || autoplayBlocked ? (
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-400 text-xs">
                    <VolumeX className="w-3 h-3 mr-1" />
                    {interviewState.currentQuestionIndex === 0 
                      ? "Нажмите ▶ для прослушивания вопроса" 
                      : isMobile ? "Нажмите для воспроизведения" : "Автовоспроизведение недоступно"}
                  </Badge>
                ) : isAudioLoading ? (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400 text-xs">
                    <div className="w-3 h-3 border border-blue-300 border-t-transparent rounded-full animate-spin mr-1" />
                    Загрузка аудио...
                  </Badge>
                ) : (
                  <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs">
                    <Speaker className="w-3 h-3 mr-1" />
                    Аудио готово
                  </Badge>
                )}

                {currentAudio && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleAudioPlayback}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    disabled={isAudioLoading}
                  >
                    {interviewState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>

            {currentQuestion && (
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    currentQuestion.difficulty === "junior"
                      ? "border-green-500 text-green-400"
                      : currentQuestion.difficulty === "middle"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-red-500 text-red-400"
                  }`}
                >
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Mobile Tips */}
        {isMobile && (
          <Card className="bg-blue-500/10 border-blue-500/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-blue-300 font-medium text-sm mb-1">Советы для мобильных устройств:</h3>
                  <ul className="text-blue-200 text-xs space-y-1">
                    <li>• Используйте наушники для лучшего качества записи</li>
                    <li>• Говорите четко и близко к микрофону</li>
                    <li>• Найдите тихое место для записи</li>
                    {autoplayBlocked && <li>• Нажмите кнопку воспроизведения для прослушивания вопроса</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Recorder */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              resetTrigger={interviewState.resetTrigger} // Передаем триггер сброса
            />
          </CardContent>
        </Card>

        {/* Recording Status */}
        {interviewState.hasRecordedCurrentQuestion && (
          <Card className="bg-green-500/10 border-green-500/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="text-green-300 font-medium text-sm">Ответ записан!</h3>
                  <p className="text-green-200 text-xs">
                    Длительность: {interviewState.responses[interviewState.currentQuestionIndex]?.duration || 0} секунд
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Завершить интервью
          </Button>

          <Button
            onClick={handleNextQuestion}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            disabled={!interviewState.hasRecordedCurrentQuestion}
          >
            {interviewState.currentQuestionIndex === interviewState.questions.length - 1 ? (
              <>
                Завершить
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Следующий вопрос
                <SkipForward className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
