import { NextRequest, NextResponse } from 'next/server'
import { RobokassaService } from '@/lib/robokassa'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { isSupabaseConfigured } from '@/lib/supabase'

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

    // ОБЯЗАТЕЛЬНАЯ проверка авторизации для серверной стороны
    console.log('🔍 API: Checking user auth for payment...')
    
    if (!isSupabaseConfigured) {
      console.log('❌ API: Supabase not configured')
      return NextResponse.json(
        { error: 'Для покупки необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('👤 API: Session check:', { 
      hasSession: !!session, 
      hasUser: !!session?.user,
      email: session?.user?.email,
      sessionError: sessionError?.message 
    })
    
    if (sessionError || !session?.user) {
      console.log('❌ API: No valid session found for payment')
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

    const userId = session.user.id
    const userEmail = session.user.email
    
    console.log('Authorized user info:', { userId, userEmail })

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