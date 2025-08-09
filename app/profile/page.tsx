"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  Clock,
  Target,
  Star,
  ArrowLeft,
  Crown,
  CreditCard,
  Settings,
  Brain,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { SupabaseAuthService } from "@/lib/auth-supabase"
import { InterviewManager } from "@/lib/interview-manager"
import { type Profile } from "@/lib/supabase"

interface InterviewResult {
  id: string
  specialty: string
  level: string
  overall_score: number
  questions_count: number
  completed_at: string
  analysis_data: any
}

// Маппинг ID специальностей на читаемые названия
const specialtyNames: Record<string, string> = {
  'frontend': 'Frontend Developer',
  'backend': 'Backend Developer',
  'devops': 'DevOps Engineer',
  'data-scientist': 'Data Scientist',
  'product-manager': 'Product Manager',
  'ux-ui-designer': 'UX/UI Designer',
  'marketing': 'Маркетинг',
  'project-manager': 'Project Manager',
  'business-analyst': 'Бизнес-аналитик',
  'system-analyst': 'Системный аналитик',
  'tech-support': 'Техническая поддержка',
  'smm': 'SMM-специалист',
  'qa': 'QA Engineer'
}

// Функция для получения читаемого названия специальности
const getSpecialtyName = (specialtyId: string): string => {
  return specialtyNames[specialtyId] || specialtyId
}

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [interviewHistory, setInterviewHistory] = useState<InterviewResult[]>([])
  const [remainingInterviews, setRemainingInterviews] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await SupabaseAuthService.getCurrentUser()
        setCurrentUser(user)

        if (user) {
          const history = await SupabaseAuthService.getInterviewHistory()
          setInterviewHistory(history)

          const remaining = await InterviewManager.getRemainingInterviews()
          setRemainingInterviews(remaining)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Необходима авторизация</h1>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Вычисляем статистику
  const totalInterviews = interviewHistory.length
  const averageScore = totalInterviews > 0
    ? Math.round(interviewHistory.reduce((sum, interview) => sum + interview.overall_score, 0) / totalInterviews)
    : 0

  const specialtyStats = interviewHistory.reduce((acc, interview) => {
    if (!acc[interview.specialty]) {
      acc[interview.specialty] = { count: 0, totalScore: 0 }
    }
    acc[interview.specialty].count++
    acc[interview.specialty].totalScore += interview.overall_score
    return acc
  }, {} as Record<string, { count: number; totalScore: number }>)

  const topSpecialties = Object.entries(specialtyStats)
    .map(([specialty, stats]) => ({
      specialty,
      count: stats.count,
      averageScore: Math.round(stats.totalScore / stats.count)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Личный кабинет</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">{currentUser.name}</CardTitle>
                    <CardDescription className="text-gray-300">{currentUser.email}</CardDescription>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-green-500/20 text-green-300 border-green-400">
                        {remainingInterviews} интервью доступно
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-400">
                        {currentUser.interviews_used} использовано
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Всего интервью</CardTitle>
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalInterviews}</div>
              <p className="text-xs text-gray-400 mt-1">Пройдено интервью</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Средний балл</CardTitle>
                <Target className="w-4 h-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{averageScore}/10</div>
              <p className="text-xs text-gray-400 mt-1">По всем интервью</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Доступно</CardTitle>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{remainingInterviews}</div>
              <p className="text-xs text-gray-400 mt-1">Интервью осталось</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Использовано</CardTitle>
                <Award className="w-4 h-4 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentUser.interviews_used}</div>
              <p className="text-xs text-gray-400 mt-1">Из {currentUser.max_interviews} всего</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="history" className="data-[state=active]:bg-white/10">
              История интервью
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-white/10">
              Статистика
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/10">
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">История интервью</CardTitle>
                <CardDescription className="text-gray-300">
                  Все ваши пройденные интервью с результатами
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviewHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Вы еще не проходили интервью</p>
                    <Link href="/">
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        Пройти первое интервью
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviewHistory.map((interview) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{getSpecialtyName(interview.specialty)}</h3>
                            <p className="text-gray-400 text-sm">
                              {interview.level} • {interview.questions_count} вопросов
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(interview.completed_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {interview.overall_score}/10
                          </div>
                          <div className="flex items-center space-x-1">
                            {interview.overall_score >= 8 ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : interview.overall_score >= 6 ? (
                              <AlertCircle className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-xs text-gray-400">
                              {interview.overall_score >= 8 ? 'Отлично' :
                                interview.overall_score >= 6 ? 'Хорошо' : 'Нужно улучшить'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Топ специальности</CardTitle>
                  <CardDescription className="text-gray-300">
                    Ваши наиболее изученные направления
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topSpecialties.length === 0 ? (
                    <p className="text-gray-400">Нет данных</p>
                  ) : (
                    <div className="space-y-3">
                      {topSpecialties.map((item, index) => (
                        <div key={item.specialty} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-white">{getSpecialtyName(item.specialty)}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{item.averageScore}/10</div>
                            <div className="text-gray-400 text-xs">{item.count} интервью</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Прогресс</CardTitle>
                  <CardDescription className="text-gray-300">
                    Ваше развитие в цифрах
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Использовано интервью</span>
                        <span className="text-white">{currentUser.interviews_used}/{currentUser.max_interviews}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${(currentUser.interviews_used / currentUser.max_interviews) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {averageScore > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">Средний балл</span>
                          <span className="text-white">{averageScore}/10</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{ width: `${averageScore * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Настройки аккаунта</CardTitle>
                <CardDescription className="text-gray-300">
                  Управление вашим профилем и подпиской
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Имя</h3>
                    <p className="text-gray-400 text-sm">{currentUser.name}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/20 hover:text-white bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    Изменить
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Email</h3>
                    <p className="text-gray-400 text-sm">{currentUser.email}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/20 hover:text-white bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    Изменить
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Интервью</h3>
                    <p className="text-gray-400 text-sm">
                      {remainingInterviews} доступно • {currentUser.interviews_used} использовано
                    </p>
                  </div>
                  <Link href="/#pricing-section">
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/20 hover:text-white bg-transparent">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Купить еще
                    </Button>
                  </Link>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await SupabaseAuthService.logout()
                        // Перенаправляем на главную страницу после выхода
                        window.location.href = '/'
                      } catch (error) {
                        console.error('Logout error:', error)
                        // В случае ошибки все равно перенаправляем
                        window.location.href = '/'
                      }
                    }}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
                  >
                    Выйти из аккаунта
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}