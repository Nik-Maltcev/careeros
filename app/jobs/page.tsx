"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Bot,
  Zap,
  Target,
  Bell,
  Users,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  Star,
  Briefcase,
  MapPin,
  Clock,
  TrendingUp,
  Brain,
  LogIn,
  LogOut,
  User,
  Crown,
} from "lucide-react"
import Link from "next/link"
import { SupabaseAuthService } from "@/lib/auth-supabase"
import { AuthDialog } from "@/components/auth-dialog"
import { PricingDialog } from "@/components/pricing-dialog"
import { isSupabaseConfigured, type Profile } from "@/lib/supabase"
import { InterviewManager } from "@/lib/interview-manager"
import { VpnWarning, VpnWarningMobile } from "@/components/vpn-warning"

export default function JobsPage() {
  // Состояние для авторизации
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showPricingDialog, setShowPricingDialog] = useState(false)
  const [remainingInterviews, setRemainingInterviews] = useState(3)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const initializeUser = async () => {
      try {
        if (isSupabaseConfigured) {
          const user = await SupabaseAuthService.getCurrentUser()
          setCurrentUser(user)
        }
        
        // Загружаем реальное количество интервью
        const remaining = await InterviewManager.getRemainingInterviews()
        console.log('Remaining interviews:', remaining)
        setRemainingInterviews(remaining)
        
      } catch (error) {
        console.error('Error initializing user:', error)
        setCurrentUser(null)
      }
    }

    initializeUser()
    
    if (isSupabaseConfigured) {
      // Подписываемся на изменения авторизации
      try {
        const { data: { subscription } } = SupabaseAuthService.onAuthStateChange(async (user) => {
          console.log('Auth state changed on jobs page:', user)
          if (user) {
            const profile = await SupabaseAuthService.getCurrentUser()
            setCurrentUser(profile)
          } else {
            setCurrentUser(null)
          }
          
          // Обновляем количество интервью при изменении пользователя
          const remaining = await InterviewManager.getRemainingInterviews()
          console.log('Updated remaining interviews:', remaining)
          setRemainingInterviews(remaining)
        })
        
        return () => {
          subscription?.unsubscribe()
        }
      } catch (error) {
        console.error('Error setting up auth listener:', error)
      }
    }
  }, [])

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
              <span className="text-lg font-bold text-foreground">CareerOS</span>
              <VpnWarningMobile />
            </div>
            
            {/* Мобильные кнопки - только самое важное */}
            <div className="flex items-center">
              {isClient && currentUser ? (
                <div className="flex items-center space-x-1">
                  <Link href="/profile" className="text-muted-foreground hover:text-muted-foreground transition-colors text-xs px-2 py-1">
                    Личный кабинет
                  </Link>
                  {currentUser.plan === 'premium' ? (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400 text-xs px-2 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-50 text-emerald-500 border-green-400 text-xs px-2 py-1">
                      {remainingInterviews} интервью
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => SupabaseAuthService.logout()}
                    className="text-muted-foreground hover:text-foreground p-1 h-7 w-7 ml-1"
                  >
                    <LogOut className="w-3 h-3" />
                  </Button>
                </div>
              ) : isClient ? (
                <div className="flex items-center space-x-1">
                  <Badge className="bg-emerald-50 text-emerald-500 border-green-400 text-xs px-2 py-1">
                    {remainingInterviews === 1 ? '1 бесплатное интервью' : `${remainingInterviews} бесплатных интервью`}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAuthDialog(true)}
                    className="bg-white/70 border-border/50 text-foreground hover:bg-white/90 text-xs px-2 py-1 h-7"
                  >
                    <LogIn className="w-3 h-3 mr-1" />
                    Войти
                  </Button>
                </div>
              ) : null}
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
              <Link href="/jobs" className="text-sky-600 font-medium">
                Найти вакансии
              </Link>
            </nav>

            <div className="flex items-center space-x-2 md:space-x-4">
              <VpnWarning />
              {isClient && currentUser ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-sky-50 border-blue-400 text-sky-600 hover:bg-blue-500/30 text-xs md:text-sm px-2 py-1"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Личный кабинет
                    </Button>
                  </Link>
                  {currentUser.plan === 'premium' ? (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400 text-xs md:text-sm px-2 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-50 text-emerald-500 border-green-400 text-xs md:text-sm px-2 py-1">
                      {remainingInterviews} интервью
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => SupabaseAuthService.logout()}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : isClient ? (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-emerald-50 text-emerald-500 border-green-400 text-xs md:text-sm px-2 py-1">
                    {remainingInterviews === 1 ? '1 бесплатное интервью' : `${remainingInterviews} бесплатных интервью`}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAuthDialog(true)}
                    className="bg-white/70 border-border/50 text-foreground hover:bg-white/90 text-xs md:text-sm"
                  >
                    <LogIn className="w-3 h-3 mr-1" />
                    Войти
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowPricingDialog(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-foreground text-xs md:text-sm"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Купить
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Page Title Section */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-border/60">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center">
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <Search className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mr-2 md:mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Найти вакансии</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Откройте для себя лучшие IT-вакансии с помощью нашего умного телеграм-бота
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          {/* Telegram Bot Hero Section */}
          <div className="text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-sky-50 rounded-full mb-4 md:mb-6">
              <Bot className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 px-4">
              Телеграм-бот для поиска вакансий
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Умный помощник, который найдет идеальную работу в IT специально для вас. 
              Персонализированный поиск, мгновенные уведомления и экспертные рекомендации.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-6 md:mt-8 px-4">
              <Button className="bg-primary hover:bg-primary/90 text-foreground px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Открыть бота
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </Button>
              <Button variant="outline" className="bg-white/70 border-border/50 text-foreground hover:bg-white/90 px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg">
                <Bell className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Настроить уведомления
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm border-border/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Target className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-foreground">Персонализированный поиск</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Бот анализирует ваши навыки и предпочтения, чтобы найти идеально подходящие вакансии
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-border/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-sky-50 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-foreground">Мгновенные уведомления</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Получайте уведомления о новых вакансиях в реальном времени, не упустите возможность
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-border/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-foreground">Экспертные рекомендации</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Получайте советы по карьере и рекомендации от экспертов индустрии
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <Card className="bg-white/90 backdrop-blur-sm border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl text-center flex items-center justify-center">
                <TrendingUp className="w-6 h-6 mr-2 text-blue-400" />
                Как это работает
              </CardTitle>
              <CardDescription className="text-muted-foreground text-center">
                Простой процесс для поиска идеальной работы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-50 rounded-full">
                    <span className="text-blue-400 font-bold text-lg">1</span>
                  </div>
                  <h3 className="text-foreground font-semibold">Настройте профиль</h3>
                  <p className="text-muted-foreground text-sm">
                    Расскажите боту о своих навыках, опыте и предпочтениях
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-full">
                    <span className="text-emerald-600 font-bold text-lg">2</span>
                  </div>
                  <h3 className="text-foreground font-semibold">Получайте предложения</h3>
                  <p className="text-muted-foreground text-sm">
                    Бот автоматически найдет и отправит подходящие вакансии
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full">
                    <span className="text-purple-400 font-bold text-lg">3</span>
                  </div>
                  <h3 className="text-foreground font-semibold">Подавайте заявки</h3>
                  <p className="text-muted-foreground text-sm">
                    Откликайтесь на интересные вакансии прямо из телеграма
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Job Cards */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground text-center">
              Примеры вакансий, которые найдет бот
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-border/60 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground">Senior Frontend Developer</CardTitle>
                      <CardDescription className="text-muted-foreground">TechCorp Inc.</CardDescription>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-500 border-0">
                      Новая
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Москва
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Полный день
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      5+ лет
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-sky-50 text-sky-600">React</Badge>
                    <Badge variant="secondary" className="bg-sky-50 text-sky-600">TypeScript</Badge>
                    <Badge variant="secondary" className="bg-sky-50 text-sky-600">Next.js</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Ищем опытного фронтенд-разработчика для работы над инновационными проектами...
                  </p>
                  <div className="text-foreground font-semibold">
                    от 200 000 ₽
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-border/60 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground">Backend Developer</CardTitle>
                      <CardDescription className="text-muted-foreground">StartupXYZ</CardDescription>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-0">
                      Горячая
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Удаленно
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Гибкий график
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      3+ года
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-500">Node.js</Badge>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-500">PostgreSQL</Badge>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-500">Docker</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Присоединяйтесь к нашей команде для создания масштабируемых решений...
                  </p>
                  <div className="text-foreground font-semibold">
                    от 150 000 ₽
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Benefits */}
          <Card className="bg-white/90 backdrop-blur-sm border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl text-center flex items-center justify-center">
                <Star className="w-6 h-6 mr-2 text-yellow-400" />
                Преимущества нашего бота
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground font-semibold mb-1">Бесплатное использование</h4>
                    <p className="text-muted-foreground text-sm">Полный доступ ко всем функциям без скрытых платежей</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground font-semibold mb-1">Актуальная база вакансий</h4>
                    <p className="text-muted-foreground text-sm">Ежедневное обновление базы данных с новыми предложениями</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground font-semibold mb-1">Умная фильтрация</h4>
                    <p className="text-muted-foreground text-sm">Алгоритмы машинного обучения для точного подбора</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground font-semibold mb-1">Поддержка 24/7</h4>
                    <p className="text-muted-foreground text-sm">Круглосуточная техническая поддержка и консультации</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center space-y-6 py-12">
            <h3 className="text-3xl font-bold text-foreground">
              Готовы найти работу мечты?
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Присоединяйтесь к тысячам IT-специалистов, которые уже нашли работу с помощью нашего бота
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary/90 text-foreground px-8 py-3 text-lg">
                <Bot className="w-5 h-5 mr-2" />
                Начать поиск вакансий
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="bg-white/70 border-border/50 text-foreground hover:bg-white/90 px-8 py-3 text-lg">
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CareerOS</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Платформа для подготовки к техническим собеседованиям с использованием ИИ
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Интервью
              </Link>
              <Link href="/resume-builder" className="hover:text-foreground transition-colors">
                Сопроводительное письмо
              </Link>
              <Link href="/jobs" className="hover:text-foreground transition-colors">
                Найти вакансии
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-border/60">
              <p className="text-muted-foreground text-xs">
                © 2024 CareerOS. Все права защищены.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Диалоги */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
      
      <PricingDialog 
        open={showPricingDialog} 
        onOpenChange={setShowPricingDialog}
      />
    </div>
  )
}
