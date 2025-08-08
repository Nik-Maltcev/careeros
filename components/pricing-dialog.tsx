"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_PLANS } from "@/lib/robokassa"
import { SupabaseAuthService } from "@/lib/auth-supabase"
import { 
  Brain, 
  Check, 
  CreditCard, 
  AlertCircle, 
  Loader2,
  Star,
  Zap
} from "lucide-react"

interface PricingDialogProps {
  isOpen?: boolean
  open?: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function PricingDialog({ isOpen, open, onClose, onOpenChange, onSuccess }: PricingDialogProps) {
  // Поддерживаем оба интерфейса
  const dialogOpen = isOpen ?? open ?? false
  const handleClose = () => {
    onClose?.()
    onOpenChange?.(false)
  }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePurchase = async (planId: string) => {
    setIsLoading(true)
    setError(null)
    setSelectedPlan(planId)

    try {
      // Проверяем авторизацию - покупка только для авторизованных пользователей
      console.log('🔍 Checking user auth for purchase...')
      const currentUser = await SupabaseAuthService.getCurrentUser()
      console.log('👤 Current user:', { hasUser: !!currentUser, email: currentUser?.email, id: currentUser?.id })
      
      if (!currentUser) {
        console.log('❌ No user found for purchase')
        setError("Для покупки необходимо войти в аккаунт")
        setIsLoading(false)
        return
      }

      const userEmail = currentUser.email
      console.log('✅ User authenticated for purchase:', { userEmail })

      // Создаем платеж
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ Payment API error:', { status: response.status, error: errorData })
        setError(errorData.error || `Ошибка сервера: ${response.status}`)
        setIsLoading(false)
        return
      }

      const data = await response.json()
      console.log('✅ Payment API success:', data)

      if (data.success) {
        // Перенаправляем на страницу оплаты Robokassa
        window.location.href = data.paymentUrl
      } else {
        setError(data.error || 'Ошибка создания платежа')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError('Произошла ошибка при создании платежа')
    } finally {
      setIsLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-white">Выберите тариф</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Получите больше интервью для подготовки к собеседованиям
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}



        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {PAYMENT_PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`bg-slate-800/50 border-slate-700 relative ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Популярный
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-3 md:pb-4 p-4 md:p-6">
                <CardTitle className="text-white text-lg md:text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  {plan.description}
                </CardDescription>
                <div className="mt-3 md:mt-4">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {plan.price}₽
                  </div>
                  <div className="text-gray-400 text-xs md:text-sm">
                    {Math.round(plan.price / plan.interviews)}₽ за интервью
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 p-4 md:p-6">
                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">
                      {plan.interviews} интервью с ИИ
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">
                      Детальный анализ ответов
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">
                      Голосовые вопросы
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">
                      История результатов
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={isLoading}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  } text-white`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Создание платежа...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Купить
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Мгновенная активация</span>
            </div>
            <div className="flex items-center space-x-1">
              <CreditCard className="w-3 h-3" />
              <span>Безопасная оплата</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Оплата обрабатывается через Robokassa
          </p>
        </div>

        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}