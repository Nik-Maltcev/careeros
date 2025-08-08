import { NextRequest, NextResponse } from 'next/server'
import { RobokassaService } from '@/lib/robokassa'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()
    
    console.log('Payment creation request:', { planId })

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // ОБЯЗАТЕЛЬНАЯ проверка авторизации через токен в заголовках
    console.log('🔍 API: Checking user auth for payment...')
    
    if (!isSupabaseConfigured) {
      console.log('❌ API: Supabase not configured')
      return NextResponse.json(
        { error: 'Для покупки необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('🔑 API: Token check:', { hasAuthHeader: !!authHeader, hasToken: !!token })
    
    if (!token) {
      console.log('❌ API: No auth token provided')
      return NextResponse.json(
        { error: 'Для покупки необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    // Проверяем токен через Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    console.log('👤 API: User check:', { 
      hasUser: !!user, 
      email: user?.email,
      id: user?.id,
      userError: userError?.message 
    })
    
    if (userError || !user) {
      console.log('❌ API: Invalid token or user not found')
      return NextResponse.json(
        { error: 'Для покупки необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    const plan = RobokassaService.getPlanById(planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    const userId = user.id
    const userEmail = user.email
    
    console.log('Authorized user info:', { userId, userEmail })

    // Создаем данные для платежа
    const payment = RobokassaService.createPayment(plan, userEmail, userId)
    
    // Временно сохраняем информацию о платеже в обычную таблицу payments
    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          inv_id: payment.invId,
          user_id: userId,
          plan_id: plan.id,
          amount: payment.outSum,
          email: userEmail,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (paymentError) {
        console.error('Error saving payment:', paymentError)
        return NextResponse.json(
          { error: 'Failed to create payment record' },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }
    
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