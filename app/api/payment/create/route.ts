import { NextRequest, NextResponse } from 'next/server'
import { RobokassaService } from '@/lib/robokassa'
import { SupabaseAuthService } from '@/lib/auth-supabase'

export async function POST(request: NextRequest) {
  try {
    const { planId, userEmail } = await request.json()
    
    console.log('Payment creation request:', { planId, userEmail })

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    const plan = RobokassaService.getPlanById(planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Получаем текущего пользователя (если авторизован)
    const currentUser = await SupabaseAuthService.getCurrentUser()
    const userId = currentUser?.id
    
    console.log('User info:', { userId, userEmail: currentUser?.email })

    // Создаем данные для платежа
    const payment = RobokassaService.createPayment(plan, userEmail, userId)
    
    // Генерируем URL для оплаты
    const paymentUrl = RobokassaService.generatePaymentUrl(payment)
    
    console.log('Payment created successfully:', {
      invId: payment.invId,
      amount: payment.outSum,
      paymentUrl
    })

    return NextResponse.json({
      success: true,
      paymentUrl,
      invId: payment.invId,
      amount: payment.outSum,
      plan: plan
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}