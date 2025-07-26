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
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PricingDialog({ isOpen, onClose, onSuccess }: PricingDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePurchase = async (planId: string) => {
    setIsLoading(true)
    setError(null)
    setSelectedPlan(planId)

    try {
      // Получаем текущего пользователя
      const currentUser = await SupabaseAuthService.getCurrentUser()
      const userEmail = currentUser?.email || email

      if (!userEmail && !currentUser) {
        setError("Введите email для продолжения")
        setIsLoading(false)
        return
      }

      // Создаем платеж
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userEmail
        }),
      })

      const data = await response.json()

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-slate-900 border-slate-700">
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

        {/* Email input для неавторизованных пользователей */}
        <div className="mb-6">
          <Label htmlFor="email" className="text-gray-300 mb-2 block">
            Email для получения доступа (если не авторизованы)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-white">
                    {plan.price}₽
                  </div>
                  <div className="text-gray-400 text-sm">
                    {Math.round(plan.price / plan.interviews)}₽ за интервью
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
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
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}