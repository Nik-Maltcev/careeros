"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SupabaseAuthService } from "@/lib/auth-supabase"
import { Brain, LogOut, TrendingUp, Award, BarChart3, Clock, Target, ArrowRight, Plus, History } from "lucide-react"
import Link from "next/link"

interface InterviewResult {
  id: string
  specialty: string
  level: string
  overall_score: number
  questions_count: number
  completed_at: string
  analysis_data: any
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [interviewHistory, setInterviewHistory] = useState<InterviewResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [interviewsRemaining, setInterviewsRemaining] = useState(0)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)

        // Загружаем пользователя
        const currentUser = await SupabaseAuthService.getCurrentUser()
        if (!currentUser) {
          router.push("/")
          return
        }

        setUser(currentUser)

        // Загружаем историю интервью
        const history = await SupabaseAuthService.getInterviewHistory()
        setInterviewHistory(Array.isArray(history) ? history : [])

        // Проверяем лимиты
        const { remainingInterviews } = await SupabaseAuthService.canStartInterview()
        setInterviewsRemaining(remainingInterviews || 0)
      } catch (error) {
        console.error("Dashboard loading error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  const handleLogout = async () => {
    await SupabaseAuthService.logout()
    router.push("/")
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 text-green-300 border-green-400"
    if (score >= 60) return "bg-yellow-500/20 text-yellow-300 border-yellow-400"
    return "bg-red-500/20 text-red-300 border-red-400"
  }

  const averageScore =
    interviewHistory.length > 0
      ? interviewHistory.reduce((sum, result) => sum + (result.overall_score || 0), 0) / interviewHistory.length
      : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">AI Interview</h1>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-white font-medium">{user?.name || user?.email}</p>
                <p className="text-xs text-blue-300">{interviewsRemaining} интервью осталось</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Добро пожаловать, {user?.name || "Пользователь"}!
          </h1>
          <p className="text-gray-300">Отслеживайте свой прогресс и продолжайте улучшать навыки собеседования</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Интервью пройдено</p>
                  <p className="text-2xl font-bold text-white">{interviewHistory.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Средний балл</p>
                  <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Осталось интервью</p>
                  <p className="text-2xl font-bold text-white">{interviewsRemaining}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Лучший результат</p>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(Math.max(...interviewHistory.map((h) => h.overall_score || 0), 0))}`}
                  >
                    {interviewHistory.length > 0
                      ? Math.max(...interviewHistory.map((h) => h.overall_score || 0)).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Start New Interview */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Новое интервью
              </CardTitle>
              <CardDescription className="text-gray-300">
                Начните новое интервью и продолжайте развивать свои навыки
              </CardDescription>
            </CardHeader>
            <CardContent>
              {interviewsRemaining > 0 ? (
                <Link href="/">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Выбрать специальность
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <div className="text-center">
                  <p className="text-orange-300 text-sm mb-3">У вас закончились бесплатные интервью</p>
                  <Button disabled className="w-full bg-gray-600 text-gray-400 cursor-not-allowed">
                    Обновить план
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Прогресс
              </CardTitle>
              <CardDescription className="text-gray-300">Ваш прогресс в разных специальностях</CardDescription>
            </CardHeader>
            <CardContent>
              {interviewHistory.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(
                    interviewHistory.reduce(
                      (acc, interview) => {
                        const specialty = interview.specialty || "unknown"
                        if (!acc[specialty]) {
                          acc[specialty] = { count: 0, totalScore: 0 }
                        }
                        acc[specialty].count++
                        acc[specialty].totalScore += interview.overall_score || 0
                        return acc
                      },
                      {} as Record<string, { count: number; totalScore: number }>,
                    ),
                  ).map(([specialty, data]) => {
                    const avgScore = data.totalScore / data.count
                    return (
                      <div key={specialty} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white capitalize">{specialty}</span>
                          <span className={`text-sm font-medium ${getScoreColor(avgScore)}`}>
                            {avgScore.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={avgScore} className="h-2" />
                        <p className="text-xs text-gray-400">{data.count} интервью</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">Пока нет данных о прогрессе</p>
                  <p className="text-sm text-gray-500">Пройдите первое интервью</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Interviews */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <History className="w-5 h-5 mr-2" />
              История интервью
            </CardTitle>
            <CardDescription className="text-gray-300">Ваши последние интервью и результаты</CardDescription>
          </CardHeader>
          <CardContent>
            {interviewHistory.length > 0 ? (
              <div className="space-y-4">
                {interviewHistory.slice(0, 5).map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium capitalize">
                          {interview.specialty} • {interview.level}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {new Date(interview.completed_at).toLocaleDateString("ru-RU")} • {interview.questions_count}{" "}
                          вопросов
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getScoreBadgeColor(interview.overall_score || 0)}>
                        {(interview.overall_score || 0).toFixed(1)}%
                      </Badge>
                      <Link
                        href={`/interview-results?id=${interview.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Подробнее →
                      </Link>
                    </div>
                  </div>
                ))}

                {interviewHistory.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Показать все ({interviewHistory.length})
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">История пуста</h3>
                <p className="text-gray-400 mb-6">
                  Вы еще не проходили интервью. Начните свое первое интервью прямо сейчас!
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Начать интервью
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
