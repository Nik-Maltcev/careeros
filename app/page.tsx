"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  Cloud,
  Code,
  Crown,
  ExternalLink,
  Headphones,
  LogIn,
  LogOut,
  Mail,
  MessageCircle,
  Mic,
  Palette,
  PieChart,
  PlayCircle,
  Quote,
  Server,
  Settings,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
  ShieldCheck,
} from "lucide-react"

import { InterviewManager } from "@/lib/interview-manager"
import { SupabaseAuthService } from "@/lib/auth-supabase"
import { isSupabaseConfigured, type Profile } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { AuthDialog } from "@/components/auth-dialog"
import { PricingDialog } from "@/components/pricing-dialog"
import { VpnWarning, VpnWarningMobile } from "@/components/vpn-warning"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const specialties = [
  {
    id: "frontend",
    title: "Frontend-разработчик",
    description: "React, архитектура UI, оптимизация, тестирование и доступность.",
    icon: Code,
    accent: "from-sky-400 via-sky-300 to-blue-500",
  },
  {
    id: "backend",
    title: "Backend-разработчик",
    description: "Проектирование API, базы данных, микросервисы и безопасность.",
    icon: Server,
    accent: "from-indigo-500 via-purple-500 to-fuchsia-500",
  },
  {
    id: "devops",
    title: "DevOps / SRE",
    description: "CI/CD, контейнеризация, инфраструктура как код и наблюдаемость.",
    icon: Cloud,
    accent: "from-emerald-400 via-teal-400 to-cyan-400",
  },
  {
    id: "data-science",
    title: "Data Scientist",
    description: "Модели, метрики, продуктовая аналитика и обработка данных.",
    icon: BarChart3,
    accent: "from-amber-400 via-orange-400 to-rose-400",
  },
  {
    id: "product",
    title: "Product Manager",
    description: "Юнит-экономика, гипотезы, метрики роста и коммуникация с командой.",
    icon: Users,
    accent: "from-blue-400 via-indigo-400 to-purple-400",
  },
  {
    id: "design",
    title: "UX/UI Designer",
    description: "Продуктовые кейсы, UX-исследования, пользовательские сценарии и UI-системы.",
    icon: Palette,
    accent: "from-pink-400 via-rose-400 to-red-400",
  },
  {
    id: "qa",
    title: "QA Engineer",
    description: "Стратегии тестирования, автоматика, отчётность и контроль качества.",
    icon: CheckCircle,
    accent: "from-lime-400 via-green-400 to-emerald-400",
  },
  {
    id: "analytics",
    title: "Аналитик",
    description: "Системный и бизнес-анализ, декомпозиция задач и документация.",
    icon: PieChart,
    accent: "from-cyan-400 via-sky-400 to-blue-400",
  },
]

const workflowSteps = [
  {
    title: "Выберите направление",
    description: "Подберите сценарий интервью под вашу роль, уровень и карьерную цель.",
    icon: Target,
  },
  {
    title: "Пройдите симуляцию",
    description: "Отвечайте на вопросы с таймерами, аудио и подсказками интервьюера.",
    icon: PlayCircle,
  },
  {
    title: "Получите аналитику",
    description: "AI выделит сильные и слабые стороны, покажет, что повторить и куда расти.",
    icon: BarChart3,
  },
]

const featureTabs = [
  {
    value: "interview",
    label: "AI-собеседования",
    title: "Виртуальное собеседование с настоящими сценариями",
    description:
      "Интервьюер задаёт вопросы уровня ведущих компаний, адаптируется к вашим ответам и следит за временем.",
    bullets: [
      "До 40 вопросов в каждой сессии под выбранный уровень",
      "Таймеры и чек-листы, чтобы собеседование ощущалось как реальное",
      "Сценарии от junior до senior со сложными уточняющими вопросами",
    ],
    icon: Brain,
  },
  {
    value: "feedback",
    label: "Обратная связь",
    title: "Глубокий пост-разбор после каждого интервью",
    description:
      "Careeros помогaет увидеть картину целиком: какие компетенции хромают, что улучшить и где взять материалы.",
    bullets: [
      "Аналитика речи: темп, уверенность, ключевые технические термины",
      "Матрица навыков и рекомендации по темам для повторения",
      "Емкие чек-листы по каждому ответу, чтобы не терять время на расшифровку",
    ],
    icon: ShieldCheck,
  },
  {
    value: "growth",
    label: "План развития",
    title: "Следующий шаг в карьерном росте",
    description:
      "Накопленные результаты складываются в персональный роадмап и помогают отслеживать прогресс.",
    bullets: [
      "История тренировок и сравнение с предыдущими результатами",
      "Трекер навыков: что уже закрыто, что требует внимания",
      "Подбор материалов и мероприятий для прокачки именно ваших пробелов",
    ],
    icon: Trophy,
  },
]

const pricingPlans = [
  {
    id: "single",
    name: "Разовая тренировка",
    price: "99 ₽",
    priceDescription: "1 интервью на 10 вопросов",
    description: "Попробуйте Careeros и оцените формат перед покупкой подписки.",
    badge: "Попробовать",
    features: [
      "1 попытка интервью любой сложности",
      "Аналитика ответов и чек-листы по улучшению",
      "Сохранение прогресса в личном кабинете",
    ],
  },
  {
    id: "basic",
    name: "Starter",
    price: "350 ₽",
    priceDescription: "5 интервью в месяц",
    description: "Идеально для подготовки к грядущему собеседованию в короткие сроки.",
    badge: "Топ выбор",
    popular: true,
    features: [
      "5 интервью + анализ речи и пауз",
      "Рекомендации по развитию soft и hard skills",
      "Приоритетная поддержка и напоминания",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "649 ₽",
    priceDescription: "Безлимитные интервью",
    description: "Формат для серьёзной подготовки и регулярных тренировок всей команды.",
    badge: "Максимум возможностей",
    features: [
      "Безлимитные интервью и сценарии на всех уровнях",
      "Командный доступ и общие отчёты",
      "Эксклюзивные сценарии от интервьюеров топ-компаний",
    ],
  },
]

const testimonials = [
  {
    name: "Ольга Морозова",
    role: "Product Manager, Яндекс",
    text: "Careeros помог подготовиться к сложному интервью за неделю. Особенно зашла аналитика: видишь пробелы и понимаешь, как обосновать решения.",
    initials: "ОМ",
  },
  {
    name: "Алексей Ким",
    role: "Senior Frontend, Avito",
    text: "Сценарии максимально приближены к реальным. Благодаря AI-обратной связи ушёл страх живого собеседования и выросла уверенность.",
    initials: "АК",
  },
  {
    name: "Дарья Соколова",
    role: "Data Scientist, Ozon",
    text: "Удобно, что платформа светлая и не перегружена. Прохожу симуляцию, тут же получаю чек-лист и планирую следующую тренировку.",
    initials: "ДС",
  },
]

const faqItems = [
  {
    question: "Сколько бесплатных попыток доступно без подписки?",
    answer:
      "Гостям доступна одна полная тренировка. После регистрации вы получите три интервью. Чтобы продолжить без лимитов, оформите план Starter или Pro.",
  },
  {
    question: "Какие направления доступны сейчас?",
    answer:
      "Сейчас доступны направления для frontend, backend, DevOps, Data Science, product-менеджеров, дизайнеров, QA и аналитиков. Мы расширяем библиотеку каждую неделю.",
  },
  {
    question: "Нужно ли что-то устанавливать?",
    answer:
      "Нет. Careeros работает в браузере на десктопе и мобильных устройствах. Для записи ответов достаточно микрофона и стабильного соединения.",
  },
  {
    question: "Можно ли тренироваться на английском?",
    answer:
      "Да. Просто выберите английскую версию сценария. Система подстроит вопросы и обратную связь под выбранный язык.",
  },
]

const statHighlights = [
  { value: "12+", label: "профессий и сценариев" },
  { value: "AI-аналитика", label: "для каждого ответа" },
  { value: "5 минут", label: "до первой тренировки" },
]

const formatAttempts = (count: number) => {
  if (count >= 900) {
    return "попыток"
  }

  const absCount = Math.abs(count) % 100
  const lastDigit = absCount % 10

  if (absCount >= 11 && absCount <= 19) {
    return "попыток"
  }
  if (lastDigit === 1) {
    return "попытка"
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return "попытки"
  }
  return "попыток"
}

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [remainingInterviews, setRemainingInterviews] = useState(3)
  const [limitWarning, setLimitWarning] = useState<string | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showPricingDialog, setShowPricingDialog] = useState(false)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  const isPremium = currentUser?.plan === "premium"
  const attemptsLabel =
    remainingInterviews >= 900
      ? "Безлимит"
      : `${remainingInterviews} ${formatAttempts(remainingInterviews)}`

  const updateUsageState = (profile: Profile | null, remaining: number) => {
    setRemainingInterviews(remaining)

    if (remaining >= 900 || profile?.plan === "premium") {
      setLimitWarning(null)
      return
    }

    if (remaining <= 0) {
      setLimitWarning("Бесплатные тренировки закончились. Подключите тариф, чтобы продолжать без ограничений.")
    } else if (remaining === 1) {
      setLimitWarning("Осталась последняя бесплатная попытка. Зафиксируйте прогресс с тарифом «Starter».")
    } else if (remaining <= 3) {
      setLimitWarning(`Осталось ${remaining} ${formatAttempts(remaining)}. Тариф «Starter» снимает лимиты и даёт аналитику речи.`)
    } else {
      setLimitWarning(null)
    }
  }

  const refreshUserState = async () => {
    try {
      const user = await SupabaseAuthService.getCurrentUser()
      const remaining = await InterviewManager.getRemainingInterviews()
      setCurrentUser(user)
      updateUsageState(user, remaining)
    } catch (error) {
      console.error("Error refreshing user state:", error)
    }
  }

  useEffect(() => {
    setIsClient(true)

    refreshUserState()

    const {
      data: { subscription },
    } = SupabaseAuthService.onAuthStateChange(async () => {
      await refreshUserState()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const scrollToSpecialities = () => {
    const node = document.getElementById("specialties-section")
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleSpecialtyClick = async (specialtyId: string) => {
    if (!isClient) return

    try {
      const { canStart, reason, remainingInterviews: remaining } = await InterviewManager.canStartInterview()
      updateUsageState(currentUser, remaining)

      if (canStart) {
        window.location.href = `/interview-prep?specialty=${specialtyId}`
        return
      }

      if (reason) {
        setLimitWarning(reason)
        toast({
          variant: "destructive",
          title: "Нельзя начать интервью",
          description: reason,
        })
      }

      if (currentUser) {
        setShowPricingDialog(true)
      } else {
        setShowAuthDialog(true)
      }
    } catch (error) {
      console.error("Error while starting interview:", error)
      toast({
        variant: "destructive",
        title: "Ошибка запуска интервью",
        description: "Попробуйте обновить страницу или повторите попытку позже.",
      })
    }
  }

  const handleDirectPurchase = async (planId: string) => {
    if (!isClient || processingPlan) return

    try {
      setProcessingPlan(planId)

      const user = await SupabaseAuthService.getCurrentUser()
      if (!user) {
        setShowAuthDialog(true)
        return
      }

      const {
        data: { session },
      } = await SupabaseAuthService.getSession()
      const accessToken = session?.access_token

      if (!accessToken) {
        setShowAuthDialog(true)
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ planId }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Код ошибки: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        window.location.replace(data.paymentUrl)
        return
      }

      throw new Error(data.error || "Не удалось сформировать ссылку на оплату.")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        toast({
          variant: "destructive",
          title: "Нет ответа от платёжного сервиса",
          description: "Похоже, запрос занял слишком много времени. Попробуйте ещё раз.",
        })
      } else {
        console.error("Direct purchase error:", error)
        toast({
          variant: "destructive",
          title: "Не удалось оформить тариф",
          description: error instanceof Error ? error.message : "Попробуйте обновить страницу и повторить попытку.",
        })
      }
    } finally {
      setProcessingPlan(null)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-white/70 backdrop-blur-xl dark:bg-background/85">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-blue-500 text-primary-foreground shadow-lg">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold text-foreground">Careeros</span>
              <span className="text-xs text-muted-foreground">современный карьерный помощник</span>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="#features" className="transition-colors hover:text-foreground">
              Возможности
            </Link>
            <Link href="#specialties-section" className="transition-colors hover:text-foreground">
              Направления
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground">
              Тарифы
            </Link>
            <Link href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {!isSupabaseConfigured && (
              <Badge variant="outline" className="hidden md:inline-flex border-dashed text-xs">
                Demo-режим
              </Badge>
            )}
            {isClient && (
              <>
                {isPremium ? (
                  <Badge className="hidden md:inline-flex gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline" className="hidden md:inline-flex border-primary/40 text-primary">
                    {attemptsLabel}
                  </Badge>
                )}
                {currentUser ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => SupabaseAuthService.logout()}
                  >
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2 rounded-full bg-white/80 px-4 text-sm shadow-sm hover:bg-white"
                    onClick={() => setShowAuthDialog(true)}
                  >
                    <LogIn className="h-4 w-4" />
                    Войти
                  </Button>
                )}
              </>
            )}
            <VpnWarningMobile className="flex md:hidden" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-24 pb-24 pt-12 md:pt-16">
        <section className="relative">
          <div className="container grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="w-fit rounded-full border-primary/30 bg-primary/5 text-primary">
                Светлый интерфейс • shadcn/ui • современный стиль
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Подготовьтесь к собеседованию в спокойной и вдохновляющей среде
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Careeros — это платформа для тренировок с реальными сценариями, AI-аналитикой и индивидуальными рекомендациями.
                Мы сохранили мощный функционал, но сделали дизайн лёгким, аккуратным и дружелюбным.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {isClient && (
                  <Badge variant="outline" className="rounded-full border-primary/30 bg-white/70 px-4 py-2 text-primary shadow-sm">
                    {attemptsLabel}
                  </Badge>
                )}
                {!isSupabaseConfigured && (
                  <Badge variant="outline" className="rounded-full border-dashed px-4 py-2 text-muted-foreground">
                    Подключите Supabase, чтобы активировать аккаунты
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="group rounded-full bg-gradient-to-r from-primary via-primary/90 to-blue-500 px-8 py-6 text-base shadow-lg hover:opacity-95"
                  onClick={scrollToSpecialities}
                >
                  Начать бесплатную тренировку
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-foreground/10 bg-white/70 px-8 py-6 text-base backdrop-blur hover:bg-white"
                  onClick={() => setShowPricingDialog(true)}
                >
                  Смотреть тарифы
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {statHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/60 bg-white/70 p-4 text-center shadow-sm backdrop-blur-md transition hover:border-primary/30 hover:shadow-md dark:bg-background/60"
                  >
                    <div className="text-xl font-semibold text-foreground">{item.value}</div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
              <VpnWarning className="hidden md:flex" />
            </div>
            <Card className="border-none bg-white/80 shadow-xl backdrop-blur-md dark:bg-background/80">
              <CardHeader className="space-y-3 pb-0">
                <Badge className="w-fit rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  Превратите волнение в уверенность
                </Badge>
                <CardTitle className="text-2xl font-semibold">
                  Что изменилось в новом интерфейсе
                </CardTitle>
                <CardDescription>
                  Свежий визуальный стиль, плавные градиенты и типографика на основе shadcn/ui. Вы быстрее погружаетесь в тренировку и меньше отвлекаетесь.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <Zap className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Прозрачная структура</p>
                    <p className="text-sm text-muted-foreground">
                      Разделы сгруппированы логично: сценарии, особенности, отзывы и тарифы. Вся информация — в нескольких скроллах.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Забота о глазах и восприятии</p>
                    <p className="text-sm text-muted-foreground">
                      Светлая палитра, мягкие тени и скругления. Контент легко читать, а кнопки выделены, но не раздражают.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <Mic className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Фокус на практике</p>
                    <p className="text-sm text-muted-foreground">
                      Навигация помогает быстро перейти к нужным сценариям и сразу приступить к тренировке или оплате нужного тарифа.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-sm text-muted-foreground">
                  Весь интерфейс построен на компонентах shadcn/ui и Tailwind. Добавляйте новые разделы и блоки, сохраняя единый стиль.
                </p>
              </CardFooter>
            </Card>
          </div>
          {limitWarning && (
            <div className="container mt-8">
              <Alert variant="destructive" className="border border-destructive/40 bg-destructive/5">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Внимание к лимиту</AlertTitle>
                <AlertDescription>{limitWarning}</AlertDescription>
              </Alert>
            </div>
          )}
        </section>

        <section id="features" className="container space-y-8">
          <div className="flex flex-col gap-4 text-center">
            <Badge variant="outline" className="mx-auto w-fit rounded-full border-border/80 bg-white/70 px-4 py-1 text-sm">
              Возможности платформы
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Сосредоточьтесь на главном — Careeros подскажет остальное
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground">
              Мы проанализировали сотни реальных собеседований и собрали лучшие практики в три ключевых направления.
              Переключайтесь между вкладками, чтобы увидеть, что включает обновлённая платформа.
            </p>
          </div>
          <Tabs defaultValue={featureTabs[0].value} className="w-full">
            <TabsList className="flex w-full flex-wrap justify-center gap-3 rounded-full bg-white/60 p-1 backdrop-blur dark:bg-background/70">
              {featureTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-full px-5 py-2 text-sm transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {featureTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsContent key={tab.value} value={tab.value} className="mt-6 focus-visible:outline-none">
                  <Card className="grid gap-8 border border-border/60 bg-white/80 p-6 backdrop-blur lg:grid-cols-[minmax(0,1fr)_360px] dark:bg-background/80">
                    <div className="space-y-6">
                      <div className="flex items-start gap-3">
                        <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                          <Icon className="h-6 w-6" />
                        </span>
                        <div>
                          <CardTitle className="text-2xl font-semibold">{tab.title}</CardTitle>
                          <CardDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
                            {tab.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="grid gap-4">
                        {tab.bullets.map((bullet) => (
                          <div
                            key={bullet}
                            className="flex items-start gap-3 rounded-xl border border-border/80 bg-white/70 p-4 shadow-sm dark:bg-background/70"
                          >
                            <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                            <p className="text-sm text-muted-foreground">{bullet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Card className="h-full border-none bg-gradient-to-br from-primary/10 via-white to-blue-100 p-6 shadow-inner dark:from-primary/15 dark:via-background dark:to-background/80">
                      <div className="flex h-full flex-col justify-between gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-foreground">Что почувствуете вы</h3>
                          <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                              <Star className="mt-1 h-4 w-4 text-primary" />
                              Больше ясности: понимаете, что спросит интервьюер и как отвечать.
                            </li>
                            <li className="flex gap-2">
                              <Star className="mt-1 h-4 w-4 text-primary" />
                              Меньше стресса: интерфейс не отвлекает и помогает сосредоточиться.
                            </li>
                            <li className="flex gap-2">
                              <Star className="mt-1 h-4 w-4 text-primary" />
                              Больше действий: чёткий план и ссылки, чтобы закрыть пробелы.
                            </li>
                          </ul>
                        </div>
                        <Button
                          variant="secondary"
                          className="rounded-full bg-white/80 text-sm font-medium text-primary hover:bg-white"
                          onClick={scrollToSpecialities}
                        >
                          Перейти к сценариям
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>
        </section>

        <section id="specialties-section" className="container space-y-10">
          <div className="flex flex-col gap-3 text-center">
            <Badge variant="outline" className="mx-auto w-fit rounded-full border-border/80 bg-white/70 px-4 py-1 text-sm">
              Направления для тренировки
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Выберите карьерный трек и начните тренировку уже сегодня
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground">
              Наборы вопросов составлены с учётом требований работодателей. Каждое интервью длится 15–25 минут и заканчивается детальной аналитикой.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {specialties.map((specialty) => {
              const Icon = specialty.icon
              return (
                <Card
                  key={specialty.id}
                  className="group flex h-full flex-col justify-between border border-border/60 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl dark:bg-background/80"
                >
                  <div className="space-y-4">
                    <div className={`inline-flex rounded-2xl bg-gradient-to-r ${specialty.accent} p-3 text-foreground`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      {specialty.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {specialty.description}
                    </CardDescription>
                  </div>
                  <Button
                    className="mt-6 w-full rounded-full bg-primary/90 py-5 text-sm font-medium shadow-sm transition group-hover:bg-primary"
                    onClick={() => handleSpecialtyClick(specialty.id)}
                  >
                    Начать интервью
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="container space-y-10">
          <div className="flex flex-col gap-3 text-center">
            <Badge variant="outline" className="mx-auto w-fit rounded-full border-border/80 bg-white/70 px-4 py-1 text-sm">
              Как проходит интервью
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              В четыре шага от волнения к уверенным ответам
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card
                  key={step.title}
                  className="relative border border-border/60 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:bg-background/80"
                >
                  <div className="absolute right-6 top-6 text-4xl font-semibold text-primary/40">
                    {(index + 1).toString().padStart(2, "0")}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-6 space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        <section id="pricing" className="container space-y-10">
          <div className="flex flex-col gap-3 text-center">
            <Badge variant="outline" className="mx-auto w-fit rounded-full border-border/80 bg-white/70 px-4 py-1 text-sm">
              Тарифы
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Выберите темп тренировок под свою цель
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground">
              Начните с разовой тренировки или подключите безлимит. Оплату обрабатывает Robokassa, чеки приходят автоматически.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex h-full flex-col border border-border/60 bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl dark:bg-background/80 ${
                  plan.popular ? "border-primary/40 shadow-xl" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-semibold text-foreground">{plan.name}</CardTitle>
                  <Badge className="rounded-full bg-primary/10 px-3 text-xs font-medium text-primary">
                    {plan.badge}
                  </Badge>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.priceDescription}</span>
                </div>
                <CardDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-1 flex-col justify-end">
                  <Button
                    className="w-full rounded-full py-5 text-sm font-medium"
                    onClick={() => handleDirectPurchase(plan.id)}
                    disabled={processingPlan === plan.id || isPremium}
                  >
                    {isPremium ? "У вас уже Premium" : processingPlan === plan.id ? "Оформляем..." : "Получить доступ"}
                  </Button>
                  {plan.id === "single" && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Хотите просто попробовать? Выбирайте разовую тренировку, она активна 24 часа.
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            После оплаты вы вернётесь в Careeros автоматически. Лимит обновится мгновенно, а чек придёт на указанную почту.
          </p>
        </section>

        <section id="faq" className="container space-y-8">
          <div className="flex flex-col gap-3 text-center">
            <Badge variant="outline" className="mx-auto w-fit rounded-full border-border/80 bg-white/70 px-4 py-1 text-sm">
              FAQ
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Частые вопросы о новой версии Careeros
            </h2>
          </div>
          <Accordion type="single" collapsible className="mx-auto w-full max-w-3xl space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`item-${index}`}
                className="rounded-2xl border border-border/60 bg-white/80 px-4 shadow-sm transition hover:border-primary/30 dark:bg-background/80"
              >
                <AccordionTrigger className="text-left text-base font-medium text-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="container">
          <Card className="overflow-hidden border border-border/60 bg-gradient-to-r from-blue-100 via-sky-100 to-emerald-100 p-10 shadow-xl dark:from-primary/20 dark:via-background dark:to-background/90">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <Badge variant="outline" className="rounded-full border-border/80 bg-white/70 px-4 py-1 text-sm">
                  Готовы к следующему шагу?
                </Badge>
                <h3 className="text-3xl font-semibold text-foreground">
                  Запишитесь на тренировку и почувствуйте уверенность на реальном собеседовании
                </h3>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Дизайн стал лёгким и дружелюбным, а функциональность — ещё мощнее. Попробуйте новую версию Careeros сегодня.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <Button
                  size="lg"
                  className="rounded-full bg-primary px-8 py-6 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
                  onClick={scrollToSpecialities}
                >
                  Начать тренировку
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-foreground/20 bg-white/80 px-8 py-6 text-sm hover:bg-white"
                  onClick={() => setShowPricingDialog(true)}
                >
                  Подобрать тариф
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <section className="container space-y-10">
          <div className="flex flex-col gap-3 text-center">
            <Badge variant="outline" className="mx-auto w-fit rounded-full border-border/80 bg-white/70 px-4 py-1 text-sm">
              Отзывы пользователей
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Профессионалы уже готовятся в новом интерфейсе
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground">
              Careeros помогает кандидатам разных уровней: от первых собеседований до перехода в другой трек.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="flex h-full flex-col justify-between border border-border/60 bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:bg-background/80"
              >
                <Quote className="h-8 w-8 text-primary/50" />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{testimonial.text}</p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-border/60 bg-white/75 py-12 backdrop-blur dark:bg-background/80">
        <div className="container space-y-10">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-primary-foreground shadow-md">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="text-lg font-semibold text-foreground">Careeros</span>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Платформа для подготовки к собеседованиям с вдохновляющим светлым интерфейсом. Создано на базе компонентов shadcn/ui.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <a href="mailto:nikmaltcev@vk.com" className="hover:text-foreground">
                    nikmaltcev@vk.com
                  </a>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <a href="tel:+79003242125" className="hover:text-foreground">
                    +7 900 324-21-25
                  </a>
                </span>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Продукт</p>
              <Link href="#features" className="block hover:text-foreground">
                Возможности
              </Link>
              <Link href="#pricing" className="block hover:text-foreground">
                Тарифы
              </Link>
              <Link href="#faq" className="block hover:text-foreground">
                Помощь и FAQ
              </Link>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Правовая информация</p>
              <a
                href="https://docs.google.com/document/d/1zL0IVdekD7hRbH0oLXce305wK2vihhYeOye9XqmZ-LA/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                Оферта
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://docs.google.com/document/d/1246j4yie5ZNovJoOZ5HlcL8uCZejeb8jTPRp9My692g/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                Политика конфиденциальности
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://docs.google.com/document/d/1gAtv0dwzobwDbc2hT5XxKJpBPZBsL22VEwSc2OkRUaE/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                Согласие на обработку данных
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <Separator className="bg-border/70" />
          <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} Careeros. Все права защищены.</span>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" className="hover:text-foreground">
                Главная
              </Link>
              <Link href="/resume-builder" className="hover:text-foreground">
                Конструктор резюме
              </Link>
              <Link href="/jobs" className="hover:text-foreground">
                Вакансии
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        showLimitMessage
        onSuccess={async () => {
          setShowAuthDialog(false)
          await refreshUserState()
          toast({
            title: "Добро пожаловать!",
            description: "Авторизация прошла успешно. Доступные интервью обновлены.",
          })
        }}
      />
      <PricingDialog
        open={showPricingDialog}
        onOpenChange={setShowPricingDialog}
        onSuccess={async () => {
          setShowPricingDialog(false)
          await refreshUserState()
          toast({
            title: "Тариф активирован",
            description: "Интервью станут доступны сразу после подтверждения оплаты.",
          })
        }}
      />
    </div>
  )
}
