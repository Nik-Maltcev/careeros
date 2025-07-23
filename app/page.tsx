"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthDialog } from "@/components/auth-dialog"
import {
  Code,
  Server,
  Cloud,
  BarChart3,
  Users,
  Palette,
  Brain,
  ArrowRight,
  User,
  LogOut,
  Crown,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target,
  PieChart,
  Settings,
  Headphones,
  Zap,
  Star,
  Percent,
  Clock,
  ArrowDown,
} from "lucide-react"
import Link from "next/link"
import { SupabaseAuthService as AuthService, type Profile as UserType } from "@/lib/auth-supabase"

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

const pricingPlans = [
  {
    id: "single",
    title: "1 интервью",
    price: 99,
    originalPrice: null,
    interviews: 1,
    pricePerInterview: 99,
    savings: null,
    popular: false,
    features: [
      "Персонализированные вопросы",
      "ИИ анализ ответов",
      "Детальная обратная связь",
      "Рекомендации по улучшению",
    ],
    gradient: "from-blue-500 to-cyan-500",
    icon: Zap,
  },
  {
    id: "pack5",
    title: "5 интервью",
    price: 349,
    originalPrice: 495, // 99 * 5
    interviews: 5,
    pricePerInterview: 70,
    savings: 29,
    popular: true,
    features: [
      "Все возможности базового плана",
      "Отслеживание прогресса",
      "Сравнение результатов",
      "Приоритетная поддержка",
    ],
    gradient: "from-purple-500 to-pink-500",
    icon: Star,
  },
  {
    id: "pack10",
    title: "10 интервью",
    price: 599,
    originalPrice: 990, // 99 * 10
    interviews: 10,
    pricePerInterview: 60,
    savings: 39,
    popular: false,
    features: ["Максимальная выгода", "Полная история интервью", "Расширенная аналитика", "Персональные рекомендации"],
    gradient: "from-green-500 to-teal-500",
    icon: Crown,
  },
]

export default function LandingPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [limitWarning, setLimitWarning] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [interviewsRemaining, setInterviewsRemaining] = useState<number>(0)
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  // Добавьте useEffect для проверки режима разработки
  useEffect(() => {
    // Показываем debug панель только в development режиме
    if (process.env.NODE_ENV === "development") {
      setShowDebugPanel(true)
    }
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      // Устанавливаем флаг клиентской среды
      setIsClient(true)
      setIsLoading(true)

      try {
        // Сначала проверяем, есть ли токены в URL
        if (window.location.hash.includes("access_token")) {
          console.log("Found auth tokens in URL, processing...")
          const result = await AuthService.handleAuthCallback()
          if (result.success) {
            setAuthMessage(result.message || "Добро пожаловать!")
            // Небольшая задержка для показа сообщения
            setTimeout(() => setAuthMessage(null), 5000)
          }
        }

        // Загружаем пользователя только на клиенте
        const currentUser = await AuthService.getCurrentUser()
        console.log("Current user loaded:", currentUser?.email || "No user")
        setUser(currentUser)

        // Проверяем лимиты интервью
        const { remainingInterviews } = await AuthService.canStartInterview()
        setInterviewsRemaining(remainingInterviews || 0)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Подписываемся на изменения аутентификации
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange(async (authUser) => {
      console.log("Auth state changed:", authUser?.email || "No user")
      if (authUser) {
        // Если пользователь аутентифицирован, загружаем его профиль
        const profile = await AuthService.getCurrentUser()
        setUser(profile)

        if (profile) {
          const { remainingInterviews } = await AuthService.canStartInterview()
          setInterviewsRemaining(remainingInterviews || 0)
        }
      } else {
        setUser(null)
        // Для гостей
        const { remainingInterviews } = await AuthService.canStartInterview()
        setInterviewsRemaining(remainingInterviews || 0)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleAuthSuccess = async () => {
    console.log("Auth success, reloading user...")
    const currentUser = await AuthService.getCurrentUser()
    setUser(currentUser)
    setLimitWarning(null)

    // Обновляем лимиты
    const { remainingInterviews } = await AuthService.canStartInterview()
    setInterviewsRemaining(remainingInterviews || 0)
  }

  const handleLogout = async () => {
    await AuthService.logout()
    setUser(null)
    // Для гостей
    const { remainingInterviews } = await AuthService.canStartInterview()
    setInterviewsRemaining(remainingInterviews || 0)
  }

  const handleSpecialtyClick = async (specialtyId: string) => {
    if (!isClient) return

    const { canStart, reason } = await AuthService.canStartInterview()

    if (canStart) {
      window.location.href = `/interview-prep?specialty=${specialtyId}`
    } else {
      setLimitWarning(reason || "Достигнут лимит интервью")
      if (!user) {
        setAuthMode("register")
        setIsAuthDialogOpen(true)
      }
    }
  }

  const getUserStatus = () => {
    if (!isClient || isLoading) {
      return {
        text: "Загрузка...",
        color: "bg-gray-500/20 text-gray-300 border-gray-400",
      }
    }

    if (!user) {
      return {
        text: `${interviewsRemaining} бесплатное интервью`,
        color: "bg-green-500/20 text-green-300 border-green-400",
      }
    }

    const remaining = Math.max(0, (user.max_interviews || 0) - (user.interviews_used || 0))
    if (user.plan === "premium") {
      return {
        text: "Premium • Безлимитно",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-400",
      }
    } else {
      return {
        text: `${remaining} интервью осталось`,
        color:
          remaining > 2
            ? "bg-blue-500/20 text-blue-300 border-blue-400"
            : "bg-orange-500/20 text-orange-300 border-orange-400",
      }
    }
  }

  const userStatus = getUserStatus()

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
      {/* Success Message */}
      {authMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/10 border border-green-500/20 rounded-lg p-4 backdrop-blur-sm max-w-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">{authMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Interview</span>
          </div>

          {/* Добавить навигационное меню */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-blue-300 transition-colors">
              Интервью
            </Link>
            <Link href="/resume-builder" className="text-white hover:text-blue-300 transition-colors">
              Создать резюме
            </Link>
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            {!isLoading && (
              <Badge className={`${userStatus.color} text-xs md:text-sm px-2 py-1`}>{userStatus.text}</Badge>
            )}

            {isClient && !isLoading && user ? (
              <div className="flex items-center space-x-2 md:space-x-3">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs md:text-sm px-2 md:px-3"
                  >
                    <User className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">{user.name}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-2 md:px-3"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : !isLoading ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAuthMode("login")
                    setIsAuthDialogOpen(true)
                  }}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs md:text-sm px-2 md:px-3"
                >
                  Вход
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAuthMode("register")
                    setIsAuthDialogOpen(true)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-xs md:text-sm px-2 md:px-3"
                >
                  Регистрация
                </Button>
              </div>
            ) : (
              <div className="w-20 h-8 bg-white/10 rounded animate-pulse" />
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
              {isClient && user && (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-6 md:px-8 py-3 text-sm md:text-base w-full sm:w-auto"
                  >
                    Личный кабинет
                  </Button>
                </Link>
              )}
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

      {/* Pricing Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Тарифные планы</h2>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto px-4">
              Выберите подходящий план для подготовки к собеседованиям
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => {
              const IconComponent = plan.icon
              return (
                <Card
                  key={plan.id}
                  className={`bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl relative ${
                    plan.popular ? "ring-2 ring-purple-500 bg-white/10" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Популярный
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4 p-6">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl mb-2">{plan.title}</CardTitle>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-bold text-white">{plan.price}₽</span>
                        {plan.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">{plan.originalPrice}₽</span>
                        )}
                      </div>

                      {plan.savings && (
                        <div className="flex items-center justify-center space-x-1">
                          <Percent className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium text-sm">
                            Экономия {plan.savings}% ({plan.originalPrice! - plan.price}₽)
                          </span>
                        </div>
                      )}

                      <p className="text-gray-300 text-sm">{plan.pricePerInterview}₽ за интервью</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full bg-gradient-to-r ${plan.gradient} hover:shadow-lg text-white border-0 transition-all duration-300 mt-6`}
                      onClick={() => {
                        if (!user) {
                          setAuthMode("register")
                          setIsAuthDialogOpen(true)
                        } else {
                          // Здесь будет логика покупки
                          console.log(`Purchase plan: ${plan.id}`)
                        }
                      }}
                    >
                      {!user ? "Зарегистрироваться" : "Купить"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    {plan.savings && (
                      <div className="text-center">
                        <Badge className="bg-green-500/20 text-green-300 border-green-400 text-xs">
                          Выгода {plan.originalPrice! - plan.price}₽
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pricing Benefits */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">Почему выгодно покупать пакеты?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Percent className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Экономия до 39%</h4>
                  <p className="text-gray-300 text-sm">Чем больше пакет, тем больше экономия на каждом интервью</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Отслеживание прогресса</h4>
                  <p className="text-gray-300 text-sm">Видите улучшения от интервью к интервью</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Больше практики</h4>
                  <p className="text-gray-300 text-sm">Практикуйтесь с разными специальностями и уровнями</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {isClient && !user && !isLoading && (
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">Преимущества регистрации</h2>
              <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto px-4">
                Зарегистрируйтесь и получите доступ к расширенным возможностям
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
                <CardContent className="p-4 md:p-6">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <ArrowRight className="w-5 md:w-6 h-5 md:h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm md:text-base">2 интервью</h3>
                  <p className="text-gray-300 text-xs md:text-sm">Бесплатный план включает 2 полных интервью</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
                <CardContent className="p-4 md:p-6">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <BarChart3 className="w-5 md:w-6 h-5 md:h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm md:text-base">История и аналитика</h3>
                  <p className="text-gray-300 text-xs md:text-sm">Отслеживайте прогресс и улучшения</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
                <CardContent className="p-4 md:p-6">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Brain className="w-5 md:w-6 h-5 md:h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm md:text-base">Персональные рекомендации</h3>
                  <p className="text-gray-300 text-xs md:text-sm">ИИ анализ ваших слабых мест</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
                <CardContent className="p-4 md:p-6">
                  <div className="w-10 md:w-12 h-10 md:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Crown className="w-5 md:w-6 h-5 md:h-6 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm md:text-base">Premium опции</h3>
                  <p className="text-gray-300 text-xs md:text-sm">Возможность обновления до безлимитного плана</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-6 md:mt-8">
              <Button
                size="lg"
                onClick={() => {
                  setAuthMode("register")
                  setIsAuthDialogOpen(true)
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 px-6 md:px-8 py-3 text-sm md:text-base"
              >
                Зарегистрироваться бесплатно
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Debug Panel - только в development */}
      {showDebugPanel && (
        <section className="py-8 px-4 border-t border-white/10">
          <div className="container mx-auto max-w-2xl">
            <Card className="bg-red-500/10 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-300 text-lg">🐛 Debug Panel (Development Only)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-300">Guest Count: {AuthService.getGuestInterviewCount()}</p>
                    <p className="text-gray-300">Debug Mode: {AuthService.getDebugInfo().debugMode ? "ON" : "OFF"}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Remaining: {interviewsRemaining}</p>
                    <p className="text-gray-300">User: {user ? user.email : "Guest"}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => {
                      AuthService.resetGuestInterviews()
                      window.location.reload()
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reset Guest Count
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      AuthService.enableDebugMode()
                      window.location.reload()
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Enable Debug
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      AuthService.fullReset()
                      window.location.reload()
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Full Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      console.log("Debug Info:", AuthService.getDebugInfo())
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Log Debug Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 md:py-8 px-4 mt-12 md:mt-16">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <p className="text-gray-400 text-sm md:text-base text-center lg:text-left">
              © 2024 AI Interview Service. Все права защищены.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 md:gap-6">
              <Link href="/contacts" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">
                Контакты
              </Link>
              <a
                href="https://docs.google.com/document/d/1gAtv0dwzobwDbc2hT5XxKJpBPZBsL22VEwSc2OkRUaE/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                Оферта
              </a>
              <a
                href="https://docs.google.com/document/d/1Ye-4NEjraFxkm7gwuXeh_CmpNnI2jBoa21487kUAG3Q/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                Правила пользования
              </a>
              <a
                href="https://docs.google.com/document/d/1246j4yie5ZNovJoOZ5HlcL8uCZejeb8jTPRp9My692g/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                Политика конфиденциальности
              </a>
              <a
                href="https://docs.google.com/document/d/1zL0IVdekD7hRbH0oLXce305wK2vihhYeOye9XqmZ-LA/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                Согласие на обработку данных
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => {
          setIsAuthDialogOpen(false)
          setLimitWarning(null)
        }}
        onAuthSuccess={handleAuthSuccess}
        mode={authMode}
      />
    </div>
  )
}
