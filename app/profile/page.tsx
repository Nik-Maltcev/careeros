"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  AlertCircle,
  LogOut,
  MessageCircle,
  ExternalLink,
  Mail,
  Trophy,
  Zap,
  Rocket,
  Send,
  Gift
} from "lucide-react"
import Link from "next/link"
import { SupabaseAuthService } from "@/lib/auth-supabase"
import { InterviewManager } from "@/lib/interview-manager"
import { type Profile } from "@/lib/supabase"
import { VpnWarning, VpnWarningMobile } from "@/components/vpn-warning"

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

// Система достижений
interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  requirement: number
  color: string
  bgColor: string
}

const achievements: Achievement[] = [
  {
    id: 'first_interview',
    title: 'Начало положено',
    description: 'Пройдите первое интервью',
    icon: Target,
    requirement: 1,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  {
    id: 'third_interview',
    title: 'На правильном пути',
    description: 'Пройдите 3 интервью',
    icon: Rocket,
    requirement: 3,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  {
    id: 'fifth_interview',
    title: 'Опытный кандидат',
    description: 'Пройдите 5 интервью',
    icon: Star,
    requirement: 5,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  {
    id: 'tenth_interview',
    title: 'Мастер собеседований',
    description: 'Пройдите 10 интервью',
    icon: Crown,
    requirement: 10,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  }
]

// Функция для получения заработанных достижений
const getEarnedAchievements = (totalInterviews: number) => {
  return achievements.filter(achievement => totalInterviews >= achievement.requirement)
}

// Компонент формы обратной связи
interface FeedbackFormProps {
  currentUser: Profile
  onSuccess: () => void
}

function FeedbackForm({ currentUser, onSuccess }: FeedbackFormProps) {
  const [stage, setStage] = useState("")
  const [purpose, setPurpose] = useState("")
  const [liked, setLiked] = useState("")
  const [improvements, setImprovements] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Проверяем, отправлял ли пользователь уже обратную связь
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        const response = await fetch('/api/check-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        })
        const data = await response.json()
        setIsSubmitted(data.hasSubmitted)
      } catch (error) {
        console.error('Error checking feedback status:', error)
      }
    }
    
    checkFeedbackStatus()
  }, [currentUser.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stage || !purpose || !liked.trim() || !improvements.trim()) {
      alert('Пожалуйста, заполните все поля')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userName: currentUser.name,
          stage,
          purpose,
          liked: liked.trim(),
          improvements: improvements.trim()
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
        setStage("")
        setPurpose("")
        setLiked("")
        setImprovements("")
        onSuccess()
        alert('Спасибо за обратную связь! Вам начислено +1 бесплатное интервью 🎉')
      } else {
        const error = await response.json()
        alert(error.message || 'Произошла ошибка при отправке')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Произошла ошибка при отправке')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Gift className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-white font-bold text-xl mb-3">Спасибо за обратную связь!</h3>
        <p className="text-gray-200 text-lg mb-4">
          Вам уже начислено <span className="text-blue-400 font-bold">+1 бесплатное интервью</span>
        </p>
        <div className="mt-6 p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
          <p className="text-blue-200 font-medium">
            Ваше мнение поможет нам сделать платформу еще лучше! 🚀
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="stage" className="text-white font-semibold text-sm">
            На каком этапе поиска сейчас находитесь?
          </Label>
          <select
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full bg-gray-900 border-2 border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 appearance-none cursor-pointer hover:border-gray-600 transition-colors"
            required
          >
            <option value="" className="bg-gray-900 text-gray-400">Выберите вариант</option>
            <option value="learning" className="bg-gray-900 text-white">Прохожу обучение</option>
            <option value="job-searching" className="bg-gray-900 text-white">Ищу работу</option>
            <option value="self-development" className="bg-gray-900 text-white">Прохожу просто для себя</option>
          </select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="purpose" className="text-white font-semibold text-sm">
            Для чего проходите интервью?
          </Label>
          <select
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-gray-900 border-2 border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 appearance-none cursor-pointer hover:border-gray-600 transition-colors"
            required
          >
            <option value="" className="bg-gray-900 text-gray-400">Выберите вариант</option>
            <option value="fear-of-interviews" className="bg-gray-900 text-white">У меня боязнь интервью</option>
            <option value="future-preparation" className="bg-gray-900 text-white">Готовлюсь на будущее</option>
            <option value="practice-after-rejections" className="bg-gray-900 text-white">У меня были отказы и я практикуюсь</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="liked" className="text-white font-semibold text-sm">
          Что понравилось?
        </Label>
        <Textarea
          id="liked"
          placeholder="Расскажите, что вам больше всего понравилось в сервисе..."
          value={liked}
          onChange={(e) => setLiked(e.target.value)}
          className="bg-gray-900 border-2 border-gray-700 text-white placeholder:text-gray-400 min-h-[100px] focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:border-gray-600 transition-colors"
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="improvements" className="text-white font-semibold text-sm">
          Чего не хватило? Что можно улучшить?
        </Label>
        <Textarea
          id="improvements"
          placeholder="Поделитесь идеями, что добавить или изменить для улучшения сервиса..."
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
          className="bg-gray-900 border-2 border-gray-700 text-white placeholder:text-gray-400 min-h-[100px] focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:border-gray-600 transition-colors"
          required
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t-2 border-gray-700">
        <div className="flex items-center space-x-2 text-gray-300">
          <Gift className="w-5 h-5 text-blue-400" />
          <span className="font-medium">За отправку: <span className="text-blue-400 font-semibold">+1 интервью</span></span>
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting || !stage || !purpose || !liked.trim() || !improvements.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Отправляем...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Отправить
            </>
          )}
        </Button>
      </div>
    </form>
  )
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
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs px-2 py-1">
                {remainingInterviews} интервью
              </Badge>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white p-1 h-7 w-7">
                  <ArrowLeft className="w-3 h-3" />
                </Button>
              </Link>
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
              <Link href="/resume-builder" className="text-white hover:text-blue-300 transition-colors">
                Сопроводительное письмо
              </Link>
              <Link href="/jobs" className="text-white hover:text-blue-300 transition-colors">
                Найти вакансии
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <VpnWarning />
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-300 border-green-400">
                  {remainingInterviews} интервью доступно
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400">
                  {currentUser.interviews_used} использовано
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await SupabaseAuthService.logout()
                    window.location.href = '/'
                  } catch (error) {
                    console.error('Logout error:', error)
                    window.location.href = '/'
                  }
                }}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
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
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Всего интервью</CardTitle>
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalInterviews}</div>
              <p className="text-xs text-gray-300 mt-1">Пройдено интервью</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Средний балл</CardTitle>
                <Target className="w-4 h-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{averageScore}/10</div>
              <p className="text-xs text-gray-300 mt-1">По всем интервью</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Доступно</CardTitle>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{remainingInterviews}</div>
              <p className="text-xs text-gray-300 mt-1">Интервью осталось</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-medium">Достижения</CardTitle>
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {getEarnedAchievements(totalInterviews).length}/{achievements.length}
              </div>
              <p className="text-xs text-gray-300 mt-1">Получено наград</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="history" className="data-[state=active]:bg-white/10">
              История интервью
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-white/10">
              Достижения
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

            {/* Форма обратной связи */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
                  Поделитесь опытом использования
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Помогите нам улучшить сервис и получите <span className="text-blue-400 font-medium">+1 бесплатное интервью</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackForm currentUser={currentUser} onSuccess={() => {
                  // Обновляем количество интервью после успешной отправки
                  InterviewManager.getRemainingInterviews().then(setRemainingInterviews)
                }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Достижения
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Ваши успехи в прохождении интервью
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => {
                    const isEarned = totalInterviews >= achievement.requirement
                    const IconComponent = achievement.icon
                    
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border transition-all ${
                          isEarned
                            ? `${achievement.bgColor} border-current ${achievement.color}`
                            : 'bg-gray-800/50 border-gray-700 text-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isEarned ? achievement.bgColor : 'bg-gray-700'
                          }`}>
                            <IconComponent className={`w-6 h-6 ${
                              isEarned ? achievement.color : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${
                              isEarned ? 'text-white' : 'text-gray-500'
                            }`}>
                              {achievement.title}
                            </h3>
                            <p className={`text-sm ${
                              isEarned ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {achievement.description}
                            </p>
                            <div className="mt-2">
                              {isEarned ? (
                                <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Получено
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-700 text-gray-400 border-gray-600 text-xs">
                                  {totalInterviews}/{achievement.requirement} интервью
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {!isEarned && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min((totalInterviews / achievement.requirement) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Статистика достижений */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Прогресс достижений</h4>
                      <p className="text-gray-400 text-sm">
                        Получено {getEarnedAchievements(totalInterviews).length} из {achievements.length} достижений
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {Math.round((getEarnedAchievements(totalInterviews).length / achievements.length) * 100)}%
                      </div>
                      <p className="text-gray-400 text-xs">завершено</p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all"
                      style={{ 
                        width: `${(getEarnedAchievements(totalInterviews).length / achievements.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
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
                  <MessageCircle className="w-8 h-8 text-white" />
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
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Написать в Telegram
                      <ExternalLink className="w-4 h-4 ml-2" />
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