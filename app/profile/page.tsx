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
    bgColor: 'bg-sky-50'
  },
  {
    id: 'third_interview',
    title: 'На правильном пути',
    description: 'Пройдите 3 интервью',
    icon: Rocket,
    requirement: 3,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
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
        <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Gift className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-foreground font-bold text-xl mb-3">Спасибо за обратную связь!</h3>
        <p className="text-muted-foreground/80 text-lg mb-4">
          Вам уже начислено <span className="text-blue-400 font-bold">+1 бесплатное интервью</span>
        </p>
        <div className="mt-6 p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
          <p className="text-sky-500 font-medium">
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
          <Label htmlFor="stage" className="text-foreground font-semibold text-sm">
            На каком этапе поиска сейчас находитесь?
          </Label>
          <select
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-card/90 px-4 py-3 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="" className="bg-white text-muted-foreground">Выберите вариант</option>
            <option value="learning" className="bg-white text-foreground">Прохожу обучение</option>
            <option value="job-searching" className="bg-white text-foreground">Ищу работу</option>
            <option value="self-development" className="bg-white text-foreground">Прохожу просто для себя</option>
          </select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="purpose" className="text-foreground font-semibold text-sm">
            Для чего проходите интервью?
          </Label>
          <select
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-card/90 px-4 py-3 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="" className="bg-white text-muted-foreground">Выберите вариант</option>
            <option value="fear-of-interviews" className="bg-white text-foreground">У меня боязнь интервью</option>
            <option value="future-preparation" className="bg-white text-foreground">Готовлюсь на будущее</option>
            <option value="practice-after-rejections" className="bg-white text-foreground">У меня были отказы и я практикуюсь</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="liked" className="text-foreground font-semibold text-sm">
          Что понравилось?
        </Label>
        <Textarea
          id="liked"
          placeholder="Расскажите, что вам больше всего понравилось в сервисе..."
          value={liked}
          onChange={(e) => setLiked(e.target.value)}
          className="min-h-[100px] rounded-lg border border-border/50 bg-card/90 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="improvements" className="text-foreground font-semibold text-sm">
          Чего не хватило? Что можно улучшить?
        </Label>
        <Textarea
          id="improvements"
          placeholder="Поделитесь идеями, что добавить или изменить для улучшения сервиса..."
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
          className="min-h-[100px] rounded-lg border border-border/50 bg-card/90 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t-2 border-border/60">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Gift className="w-5 h-5 text-blue-400" />
          <span className="font-medium">За отправку: <span className="text-blue-400 font-semibold">+1 интервью</span></span>
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting || !stage || !purpose || !liked.trim() || !improvements.trim()}
          className="bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Необходима авторизация</h1>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_55%)] bg-gradient-to-br from-sky-50 via-background to-emerald-50">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55">
        <div className="container mx-auto px-4 py-3">
          {/* Мобильная версия */}
          <div className="flex md:hidden items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">CareerOS</span>
              <VpnWarningMobile />
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-emerald-50 text-emerald-500 border-green-400 text-xs px-2 py-1">
                {remainingInterviews} интервью
              </Badge>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1 h-7 w-7">
                  <ArrowLeft className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Десктопная версия */}
          <div className="hidden md:flex items-center justify-between py-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CareerOS</span>
            </div>

            {/* Навигационное меню */}
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-foreground hover:text-sky-600 transition-colors">
                Интервью
              </Link>
              <Link href="/resume-builder" className="text-foreground hover:text-sky-600 transition-colors">
                Сопроводительное письмо
              </Link>
              <Link href="/jobs" className="text-foreground hover:text-sky-600 transition-colors">
                Найти вакансии
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <VpnWarning />
              <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-50 text-emerald-500 border-green-400">
                  {remainingInterviews} интервью доступно
                </Badge>
                <Badge className="bg-sky-50 text-sky-600 border-blue-400">
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
                className="border-red-500/40 bg-transparent text-red-500 shadow-sm hover:bg-red-500/10 hover:text-red-400"
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
        <div className="mb-10">
          <Card className="relative overflow-hidden border border-border/50 bg-card/95 shadow-xl ring-1 ring-primary/10">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-sky-200/40 via-transparent to-transparent sm:block" />
            <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl" />
            <CardHeader className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 text-primary-foreground shadow-lg ring-2 ring-sky-500/25">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-semibold text-foreground">{currentUser.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">{currentUser.email}</CardDescription>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1.5 border-transparent bg-sky-100 text-sky-700 shadow-sm ring-1 ring-sky-500/20">
                      <Zap className="h-3.5 w-3.5" />
                      {remainingInterviews} доступных попыток
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5 border-transparent bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-500/20">
                      <Award className="h-3.5 w-3.5" />
                      {currentUser.interviews_used} интервью пройдено
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="shadow-lg ring-1 ring-sky-500/20">
                  <Link href="/interview">
                    <Rocket className="h-5 w-5" />
                    <span>Начать интервью</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-muted/70 text-foreground shadow-sm hover:bg-muted"
                >
                  <Link href="#profile-tabs">
                    <Settings className="h-5 w-5" />
                    <span>Настройки</span>
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
          <Card className="relative overflow-hidden rounded-2xl border border-border/20 bg-white shadow-lg shadow-black/5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Всего интервью</p>
                  <p className="mt-5 text-4xl font-bold text-foreground">{totalInterviews}</p>
                  <p className="mt-3 text-sm text-muted-foreground/80">Пройденные интервью</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
                  <BarChart3 className="h-5 w-5 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-2xl border border-border/20 bg-white shadow-lg shadow-black/5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Средний балл</p>
                  <p className="mt-5 text-4xl font-bold text-foreground">{averageScore}/10</p>
                  <p className="mt-3 text-sm text-muted-foreground/80">По всем интервью</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-2xl border border-border/20 bg-white shadow-lg shadow-black/5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 via-indigo-500 to-purple-600" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Доступно</p>
                  <p className="mt-5 text-4xl font-bold text-foreground">{remainingInterviews}</p>
                  <p className="mt-3 text-sm text-muted-foreground/80">Свободных попыток</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                  <Clock className="h-5 w-5 text-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-2xl border border-border/20 bg-white shadow-lg shadow-black/5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Достижения</p>
                  <p className="mt-5 text-4xl font-bold text-foreground">{getEarnedAchievements(totalInterviews).length}/{achievements.length}</p>
                  <p className="mt-3 text-sm text-muted-foreground/80">Получено наград</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                  <Trophy className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Tabs */}
        <Tabs id="profile-tabs" defaultValue="history" className="space-y-6">
          <TabsList className="rounded-xl border border-border/40 bg-muted/50 p-1 shadow-sm backdrop-blur">
            <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              История интервью
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Достижения
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Статистика
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="border border-border/50 bg-card/95 shadow-lg ring-1 ring-border/40">
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-xl font-semibold text-foreground">История интервью</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Все ваши пройденные интервью с результатами
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviewHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Вы еще не проходили интервью</p>
                    <Link href="/">
                      <Button className="mt-4 shadow-md hover:shadow-lg">
                        Пройти первое интервью
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviewHistory.map((interview) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/40 p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <h3 className="text-foreground font-medium">{getSpecialtyName(interview.specialty)}</h3>
                            <p className="text-muted-foreground text-sm">
                              {interview.level} • {interview.questions_count} вопросов
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(interview.completed_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">
                            {interview.overall_score}/10
                          </div>
                          <div className="flex items-center space-x-1">
                            {interview.overall_score >= 8 ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            ) : interview.overall_score >= 6 ? (
                              <AlertCircle className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-xs text-muted-foreground">
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
            <Card className="bg-white/70 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
                  Поделитесь опытом использования
                </CardTitle>
                <CardDescription className="text-muted-foreground">
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
            <Card className="border border-border/50 bg-card/95 shadow-lg ring-1 ring-border/40">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Достижения
                </CardTitle>
                <CardDescription className="text-muted-foreground">
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
                            : 'bg-muted/40 border-border/50 text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isEarned ? achievement.bgColor : 'bg-muted'
                          }`}>
                            <IconComponent className={`w-6 h-6 ${
                              isEarned ? achievement.color : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${
                              isEarned ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {achievement.title}
                            </h3>
                            <p className={`text-sm ${
                              isEarned ? 'text-muted-foreground' : 'text-muted-foreground/80'
                            }`}>
                              {achievement.description}
                            </p>
                            <div className="mt-2">
                              {isEarned ? (
                                <Badge className="bg-emerald-50 text-emerald-500 border-green-400 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Получено
                                </Badge>
                              ) : (
                                <Badge className="bg-muted text-muted-foreground border-border/40 text-xs">
                                  {totalInterviews}/{achievement.requirement} интервью
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {!isEarned && (
                          <div className="mt-3">
                            <div className="w-full bg-muted rounded-full h-2">
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
                <div className="mt-6 pt-6 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-foreground font-medium">Прогресс достижений</h4>
                      <p className="text-muted-foreground text-sm">
                        Получено {getEarnedAchievements(totalInterviews).length} из {achievements.length} достижений
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {Math.round((getEarnedAchievements(totalInterviews).length / achievements.length) * 100)}%
                      </div>
                      <p className="text-muted-foreground text-xs">завершено</p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-muted rounded-full h-3">
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
              <Card className="border border-border/50 bg-card/95 shadow-lg ring-1 ring-border/40">
                <CardHeader>
                  <CardTitle className="text-foreground">Топ специальности</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Ваши наиболее изученные направления
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topSpecialties.length === 0 ? (
                    <p className="text-muted-foreground">Нет данных</p>
                  ) : (
                    <div className="space-y-3">
                      {topSpecialties.map((item, index) => (
                        <div key={item.specialty} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-foreground text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-foreground">{getSpecialtyName(item.specialty)}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-foreground font-medium">{item.averageScore}/10</div>
                            <div className="text-muted-foreground text-xs">{item.count} интервью</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-card/95 shadow-lg ring-1 ring-border/40">
                <CardHeader>
                  <CardTitle className="text-foreground">Прогресс</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Ваше развитие в цифрах
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Использовано интервью</span>
                        <span className="text-foreground">{currentUser.interviews_used}/{currentUser.max_interviews}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${(currentUser.interviews_used / currentUser.max_interviews) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {averageScore > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Средний балл</span>
                          <span className="text-foreground">{averageScore}/10</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
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
            <Card className="border border-border/50 bg-card/95 shadow-lg ring-1 ring-border/40">
              <CardHeader>
                <CardTitle className="text-foreground">Настройки аккаунта</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Управление вашим профилем и подпиской
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <div>
                    <h3 className="text-foreground font-medium">Имя</h3>
                    <p className="text-muted-foreground text-sm">{currentUser.name}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border/40 bg-transparent text-foreground shadow-sm transition-colors hover:bg-muted/60">
                    <Settings className="w-4 h-4 mr-2" />
                    Изменить
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <div>
                    <h3 className="text-foreground font-medium">Email</h3>
                    <p className="text-muted-foreground text-sm">{currentUser.email}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border/40 bg-transparent text-foreground shadow-sm transition-colors hover:bg-muted/60">
                    <Settings className="w-4 h-4 mr-2" />
                    Изменить
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                  <div>
                    <h3 className="text-foreground font-medium">Интервью</h3>
                    <p className="text-muted-foreground text-sm">
                      {remainingInterviews} доступно • {currentUser.interviews_used} использовано
                    </p>
                  </div>
                  <Link href="/#pricing-section">
                    <Button variant="outline" size="sm" className="border-border/40 bg-transparent text-foreground shadow-sm transition-colors hover:bg-muted/60">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Купить еще
                    </Button>
                  </Link>
                </div>

                <div className="pt-4 border-t border-border/60">
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
                    className="border-red-500/40 bg-transparent text-red-500 shadow-sm hover:bg-red-500/10 hover:text-red-400"
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
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">Нужна помощь?</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
              Если у вас возникли проблемы или есть вопросы/предложения, пишите нам в Telegram бот
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/95 p-6 shadow-xl ring-1 ring-primary/15 md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/40 via-transparent to-purple-100/40" />
              <div className="pointer-events-none absolute -top-14 -left-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-12 h-48 w-48 rounded-full bg-purple-200/40 blur-3xl" />
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-foreground" />
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
                    <Button className="px-6 py-3 shadow-lg ring-1 ring-primary/15">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Написать в Telegram
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  
                  <Button 
                    variant="outline" 
                    className="px-6 py-3 border-border/40 text-sky-700 bg-transparent shadow-sm hover:bg-muted/60"
                    onClick={() => window.open('mailto:support@careeros.ru', '_blank')}
                  >
                    <Mail className="w-5 h-5 mr-2" />
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
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
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
    </div>
  )
}
