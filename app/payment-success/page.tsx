"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseAuthService } from '@/lib/auth-supabase'

export default function PaymentSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const syncPayment = async () => {
      console.log('🎉 Payment success page loaded, syncing payments...')
      
      try {
        // Небольшая задержка для обработки платежа
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const { data: { session } } = await SupabaseAuthService.getSession()
        if (session?.access_token) {
          const response = await fetch('/api/sync-payments', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          const result = await response.json()
          console.log('✅ Payment sync result:', result)
        }
      } catch (error) {
        console.error('Payment sync error:', error)
      }
      
      // Перенаправляем на главную страницу через 5 секунд
      setTimeout(() => {
        router.push('/')
      }, 5000)
    }

    syncPayment()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Оплата прошла успешно!</h1>
        <p className="text-gray-300 mb-6">
          Ваши интервью добавляются к аккаунту...
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Перенаправление на главную страницу через несколько секунд...
        </p>
      </div>
    </div>
  )
}