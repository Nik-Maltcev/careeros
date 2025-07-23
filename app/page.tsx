"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Code,
  Server,
  Cloud,
  BarChart3,
  Users,
  Palette,
  Brain,
  ArrowRight,
  TrendingUp,
  Target,
  PieChart,
  Settings,
  Headphones,
  CheckCircle,
  AlertTriangle,
  ArrowDown,
  Clock,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { InterviewManager } from "@/lib/interview-manager"

const specialties = [
  {
    id: "frontend",
    title: "Frontend Developer",
    description: "Разработка пользовательских интерфейсов на React, Vue, Angular",
    icon: Code,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "backend",
    title: "Backend Developer",
    description: "Серверная разработка, API, базы данных и архитектура",
    icon: Server,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "devops",
    title: "DevOps Engineer",
    description: "Автоматизация, CI/CD, облачные технологии и инфраструктура",
    icon: Cloud,
    gradient: "from-green-500 to-teal-500",
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Анализ данных, машинное обучение и статистическое моделирование",
    icon: BarChart3,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    description: "Управление продуктом, стратегия развития и работа с командой",
    icon: Users,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "ux-ui-designer",
    title: "UX/UI Designer",
    description: "Дизайн интерфейсов, пользовательский опыт и прототипирование",
    icon: Palette,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "marketing",
    title: "Маркетинг",
    description: "Цифровой маркетинг, аналитика, продвижение и реклама",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    id: "project-manager",
    title: "Project Manager",
    description: "Управление проектами, планирование, координация команды",
    icon: Target,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "business-analyst",
    title: "Бизнес-аналитик",
    description: "Анализ бизнес-процессов, требования, оптимизация",
    icon: PieChart,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "system-analyst",
    title: "Системный аналитик",
    description: "Анализ систем, техническая документация, архитектура",
    icon: Settings,
    gradient: "from-slate-500 to-gray-500",
  },
  {
    id: "tech-support",
    title: "Техническая поддержка",
    description: "Поддержка пользователей, решение технических проблем",
    icon: Headphones,
    gradient: "from-sky-500 to-blue-500",
  },
]

export default function LandingPage() {
  const [limitWarning, setLimitWarning] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [remainingInterviews, setRemainingInterviews] = useState(3)

  useEffect(() => {
    setIsClient(true)
    // Обновляем количество оставшихся интервью
    const remaining = InterviewManager.getRemainingInterviews()
    setRemainingInterviews(remaining)
  }, [])

  const handleSpecialtyClick = (specialtyId: string) => {
    if (!isClient) return

    const { canStart, reason } = InterviewManager.canStartInterview()

    if (canStart) {
      window.location.href = `/interview-prep?specialty=${specialtyId}`
    } else {
      setLimitWarning(reason || "Достигнут лимит интервью")
    }
  }

  // Функция для плавной прокрутки к секции специальностей
  const scrollToSpecialities = () => {
    const specialtiesSection = document.getElementById("specialties-section")
    if (specialtiesSection) {
      specialtiesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Careeros</span>
          </div>

          {/* Навигационное меню */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-blue-300 transition-colors">
              Интервью
            </Link>
            <Link href="/resume-builder" className="text-white hover:text-blue-300 transition-colors">
              Сопроводительное письмо
            </Link>
            <Link href="/interview-results" className="text-white hover:text-blue-300 transition-colors">
              Результаты
            </Link>
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            {isClient && (
              <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs md:text-sm px-2 py-1">
                {remainingInterviews} бесплатных интервью
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Пройди собеседование с{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ИИ</span> и
              получи персональную обратную связь
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed px-4">
              Подготовься к реальному собеседованию с помощью искусственного интеллекта. Получи детальный анализ своих
              ответов и рекомендации по улучшению.
            </p>

            {limitWarning && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <p className="text-orange-300 text-sm">{limitWarning}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    InterviewManager.resetAllData()
                    window.location.reload()
                  }}
                  className="mt-3 bg-orange-600 hover:bg-orange-700 text-white text-xs"
                >
                  Сбросить счетчик
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button
                size="lg"
                onClick={scrollToSpecialities}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-6 md:px-8 py-3 text-sm md:text-base"
              >
                Начать бесплатно
                <ArrowDown className="w-4 md:w-5 h-4 md:h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 px-4">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                Присоединяйтесь к тысячам успешных кандидатов
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                Наша платформа помогает IT-специалистам готовиться к собеседованиям
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="text-2xl md:text-4xl font-bold text-blue-400 mb-2">1,200+</div>
                  <div className="text-xs md:text-sm text-gray-300">Интервью проведено</div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="text-2xl md:text-4xl font-bold text-green-400 mb-2">850+</div>
                  <div className="text-xs md:text-sm text-gray-300">Довольных пользователей</div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="text-2xl md:text-4xl font-bold text-purple-400 mb-2">11</div>
                  <div className="text-xs md:text-sm text-gray-300">IT-специальностей</div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="text-2xl md:text-4xl font-bold text-yellow-400 mb-2">92%</div>
                  <div className="text-xs md:text-sm text-gray-300">Успешных собеседований</div>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-6 md:mt-8">
              <div className="text-center">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-lg md:text-xl font-bold text-white">ИИ-анализ</div>
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">
                    Персонализированная обратная связь на основе ваших ответов
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-lg md:text-xl font-bold text-white">24/7</div>
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">Доступность платформы в любое удобное время</div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-lg md:text-xl font-bold text-white">Прогресс</div>
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">Отслеживание улучшений от интервью к интервью</div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 md:mt-12 text-center">
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-gray-400 text-xs md:text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Безопасность данных</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Актуальные вопросы</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Экспертная оценка</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Мгновенные результаты</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties-section" className="py-12 md:py-16 px-4 scroll-mt-20">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Выберите свою специальность</h2>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto px-4">
              Персонализированные вопросы для каждой IT-специальности с учетом актуальных требований рынка
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {specialties.map((specialty) => {
              const IconComponent = specialty.icon
              return (
                <div key={specialty.id} className="block">
                  <Card
                    className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer h-full"
                    onClick={() => handleSpecialtyClick(specialty.id)}
                  >
                    <CardHeader className="text-center pb-4 p-4 md:p-6">
                      <div
                        className={`w-12 md:w-16 h-12 md:h-16 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-r ${specialty.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-6 md:w-8 h-6 md:h-8 text-white" />
                      </div>
                      <CardTitle className="text-white text-lg md:text-xl mb-2">{specialty.title}</CardTitle>
                      <CardDescription className="text-gray-300 text-sm leading-relaxed">
                        {specialty.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 p-4 md:p-6">
                      <Button
                        className={`w-full bg-gradient-to-r ${specialty.gradient} hover:shadow-lg hover:shadow-purple-500/25 text-white border-0 group-hover:scale-105 transition-all duration-300 text-sm md:text-base`}
                      >
                        Выбрать
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Как это работает</h2>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto px-4">
              Простой процесс подготовки к собеседованию с персональной обратной связью
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Выберите специальность</h3>
              <p className="text-gray-300">
                Выберите свою IT-специальность из 11 доступных направлений для получения персонализированных вопросов
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Пройдите интервью</h3>
              <p className="text-gray-300">
                Отвечайте на вопросы голосом или текстом. ИИ генерирует актуальные вопросы для вашего уровня
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Получите анализ</h3>
              <p className="text-gray-300">
                Получите детальную обратную связь с оценками, рекомендациями и планом развития
              </p>
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
              <span className="text-xl font-bold text-white">Careeros</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Платформа для подготовки к техническим собеседованиям с использованием ИИ
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">
                Главная
              </Link>
              <Link href="/resume-builder" className="hover:text-white transition-colors">
                Сопроводительное письмо
              </Link>
              <Link href="/interview-results" className="hover:text-white transition-colors">
                Результаты
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-500 text-xs">
                © 2024 Careeros. Все права защищены.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}