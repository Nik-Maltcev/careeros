"use client"

import { useState } from "react"
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
  AlertCircle,
  Trophy,
  Zap,
  Code,
  Server,
  Palette,
  MessageCircle,
  ExternalLink,
  Mail
} from "lucide-react"
import Link from "next/link"

// Демо данные для красивого профиля
const demoUser = {
  name: "Андрей Соколов",
  email: "andrey.sokolov@mail.ru",
  plan: "basic",
  interviews_used: 15,
  max_interviews: 20,
  created_at: "2024-01-15",
  avatar_url: null
}

const demoInterviewHistory = [
  {
    id: "1",
    specialty: "frontend",
    level: "Middle",
    overall_score: 9.2,
    questions_count: 8,
    completed_at: "2024-02-08T14:30:00Z",
    analysis_data: {
      strengths: ["React", "TypeScript", "CSS"],
      weaknesses: ["Testing", "Performance"]
    }
  },
  {
    id: "2", 
    specialty: "backend",
    level: "Senior",
    overall_score: 8.7,
    questions_count: 10,
    completed_at: "2024-02-06T10:15:00Z",
    analysis_data: {
      strengths: ["Node.js", "Databases", "API Design"],
      weaknesses: ["Microservices", "DevOps"]
    }
  },
  {
    id: "3",
    specialty: "frontend",
    level: "Senior", 
    overall_score: 8.9,
    questions_count: 12,
    completed_at: "2024-02-04T16:45:00Z",
    analysis_data: {
      strengths: ["Vue.js", "State Management", "UI/UX"],
      weaknesses: ["Mobile Development"]
    }
  },
  {
    id: "4",
    specialty: "devops",
    level: "Middle",
    overall_score: 7.8,
    questions_count: 9,
    completed_at: "2024-02-02T11:20:00Z",
    analysis_data: {
      strengths: ["Docker", "CI/CD", "AWS"],
      weaknesses: ["Kubernetes", "Monitoring"]
    }
  },
  {
    id: "5",
    specialty: "frontend",
    level: "Middle",
    overall_score: 9.1,
    questions_count: 7,
    completed_at: "2024-01-30T13:10:00Z",
    analysis_data: {
      strengths: ["React", "JavaScript", "HTML/CSS"],
      weaknesses: ["Testing", "Build Tools"]
    }
  },
  {
    id: "6",
    specialty: "ux-ui-designer",
    level: "Middle",
    overall_score: 8.5,
    questions_count: 6,
    completed_at: "2024-01-28T15:30:00Z",
    analysis_data: {
      strengths: ["Figma", "User Research", "Prototyping"],
      weaknesses: ["Animation", "Accessibility"]
    }
  }
]

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

const specialtyIcons: Record<string, any> = {
  'frontend': Code,
  'backend': Server,
  'devops': Settings,
  'ux-ui-designer': Palette,
  'data-scientist': BarChart3,
  'product-manager': Target,
  'marketing': TrendingUp,
  'project-manager': Calendar,
  'business-analyst': Award,
  'system-analyst': Brain,
  'tech-support': Settings,
  'smm': Star,
  'qa': CheckCircle
}

// Функция для получения читаемого названия специальности
const getSpecialtyName = (specialtyId: string): string => {
  return specialtyNames[specialtyId] || specialtyId
}

const getSpecialtyIcon = (specialtyId: string) => {
  return specialtyIcons[specialtyId] || Brain
}

export default function ProfileAndreyPage() {
  const [activeTab, setActiveTab] = useState("history")
  
  const currentUser = demoUser
  const interviewHistory = demoInterviewHistory
  const remainingInterviews = 5

  // Вычисляем статистику
  const totalInterviews = interviewHistory.length
  const averageScore = totalInterviews > 0
    ? Math.round((interviewHistory.reduce((sum, interview) => sum + interview.overall_score, 0) / totalInterviews) * 10) / 10
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
      averageScore: Math.round((stats.totalScore / stats.count) * 10) / 10
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-emerald-400"
    if (score >= 8) return "text-emerald-600" 
    if (score >= 7) return "text-yellow-400"
    if (score >= 6) return "text-orange-400"
    return "text-red-400"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 9) return <Trophy className="w-4 h-4 text-emerald-400" />
    if (score >= 8) return <CheckCircle className="w-4 h-4 text-emerald-600" />
    if (score >= 7) return <Star className="w-4 h-4 text-yellow-400" />
    return <AlertCircle className="w-4 h-4 text-orange-400" />
  }

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Превосходно"
    if (score >= 8) return "Отлично"
    if (score >= 7) return "Хорошо"
    if (score >= 6) return "Удовлетворительно"
    return "Нужно улучшить"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur-sm bg-white/90">
        <div className="container mx-auto px-4 py-3">
          {/* Мобильная версия */}
          <div className="flex md:hidden items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Careeros</span>
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
              <span className="text-xl font-bold text-foreground">Careeros</span>
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
              <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-50 text-emerald-500 border-green-400">
                  {remainingInterviews} интервью доступно
                </Badge>
                <Badge className="bg-sky-50 text-sky-600 border-blue-400">
                  {currentUser.interviews_used} использовано
                </Badge>
              </div>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-sky-600 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  На главную
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-white/90 border-border/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground text-3xl">
                      {currentUser.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">{currentUser.email}</CardDescription>
                    <div className="flex items-center space-x-3 mt-3">
                      <Badge className="bg-emerald-50 text-emerald-500 border-green-400">
                        <Zap className="w-3 h-3 mr-1" />
                        {remainingInterviews} интервью доступно
                      </Badge>
                      <Badge className="bg-sky-50 text-sky-600 border-blue-400">
                        <Trophy className="w-3 h-3 mr-1" />
                        {currentUser.interviews_used} пройдено
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-400">
                        <Star className="w-3 h-3 mr-1" />
                        Средний балл {averageScore}
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
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-sm font-medium">Всего интервью</CardTitle>
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalInterviews}</div>
              <p className="text-xs text-muted-foreground mt-1">Пройдено интервью</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-sm font-medium">Средний балл</CardTitle>
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{averageScore}/10</div>
              <p className="text-xs text-muted-foreground mt-1">Отличный результат!</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-sm font-medium">Доступно</CardTitle>
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{remainingInterviews}</div>
              <p className="text-xs text-muted-foreground mt-1">Интервью осталось</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-sm font-medium">Прогресс</CardTitle>
                <Award className="w-5 h-5 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{Math.round((currentUser.interviews_used / currentUser.max_interviews) * 100)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Из {currentUser.max_interviews} интервью</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/90 border-border/60">
            <TabsTrigger value="history" className="data-[state=active]:bg-white/70">
              История интервью
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-white/70">
              Статистика
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-white/70">
              Достижения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-white/90 border-border/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>История интервью</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Все ваши пройденные интервью с детальными результатами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interviewHistory.map((interview) => {
                    const SpecialtyIcon = getSpecialtyIcon(interview.specialty)
                    return (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between p-6 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-border/60 hover:border-border/50 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <SpecialtyIcon className="w-6 h-6 text-foreground" />
                          </div>
                          <div>
                            <h3 className="text-foreground font-semibold text-lg">{getSpecialtyName(interview.specialty)}</h3>
                            <p className="text-muted-foreground text-sm">
                              {interview.level} • {interview.questions_count} вопросов
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(interview.completed_at).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              {interview.analysis_data.strengths.slice(0, 3).map((strength: string) => (
                                <Badge key={strength} className="bg-emerald-50 text-emerald-500 border-green-400 text-xs">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(interview.overall_score)}`}>
                            {interview.overall_score}/10
                          </div>
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            {getScoreIcon(interview.overall_score)}
                            <span className="text-xs text-muted-foreground">
                              {getScoreLabel(interview.overall_score)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/90 border-border/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span>Топ специальности</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Ваши наиболее изученные направления
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topSpecialties.map((item, index) => {
                      const SpecialtyIcon = getSpecialtyIcon(item.specialty)
                      return (
                        <div key={item.specialty} className="flex items-center justify-between p-4 bg-white/90 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-foreground text-sm font-bold ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                              'bg-gradient-to-r from-orange-600 to-red-600'
                            }`}>
                              {index + 1}
                            </div>
                            <SpecialtyIcon className="w-5 h-5 text-blue-400" />
                            <span className="text-foreground font-medium">{getSpecialtyName(item.specialty)}</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${getScoreColor(item.averageScore)}`}>{item.averageScore}/10</div>
                            <div className="text-muted-foreground text-xs">{item.count} интервью</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 border-border/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Прогресс развития</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Ваше развитие в цифрах
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Использовано интервью</span>
                        <span className="text-foreground font-medium">{currentUser.interviews_used}/{currentUser.max_interviews}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(currentUser.interviews_used / currentUser.max_interviews) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Средний балл</span>
                        <span className="text-foreground font-medium">{averageScore}/10</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${averageScore * 10}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Специальностей изучено</span>
                        <span className="text-foreground font-medium">{Object.keys(specialtyStats).length}/13</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(Object.keys(specialtyStats).length / 13) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Достижения */}
              <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                  <CardTitle className="text-foreground">Первое интервью</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Прошли первое интервью
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Star className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <CardTitle className="text-foreground">Отличник</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Средний балл выше 8.5
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Brain className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <CardTitle className="text-foreground">Эксперт</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Прошли 10+ интервью
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Code className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                  <CardTitle className="text-foreground">Frontend Мастер</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    3+ интервью по Frontend
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Zap className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <CardTitle className="text-foreground">Скоростной</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    5 интервью за неделю
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Target className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                  <CardTitle className="text-foreground">Целеустремленный</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Прошли интервью по 4 специальностям
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
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
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-sky-200 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <div className="text-center">
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
                    <Button className="bg-blue-500 hover:bg-primary text-foreground px-6 py-3">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Написать в Telegram
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  
                  <Button 
                    variant="outline" 
                    className="border-blue-500/50 text-sky-600 hover:bg-sky-50 hover:border-blue-400 px-6 py-3 bg-transparent"
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
