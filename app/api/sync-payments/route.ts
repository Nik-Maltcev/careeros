import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { RobokassaService } from '@/lib/robokassa'

export async function POST(request: NextRequest) {
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // Проверяем токен через Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      )
    }

    console.log('🔄 Syncing payments for user:', user.id)

    // Находим все необработанные платежи пользователя
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('Error fetching pending payments:', paymentsError)
      return NextResponse.json(
        { error: 'Ошибка получения платежей' },
        { status: 500 }
      )
    }

    console.log('📋 Found pending payments:', pendingPayments)

    if (!pendingPayments || pendingPayments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Нет необработанных платежей',
        processedCount: 0
      })
    }

    // Получаем профиль пользователя
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Профиль не найден' },
        { status: 404 }
      )
    }

    let totalInterviewsAdded = 0
    let processedPayments = 0

    // Обрабатываем каждый платеж
    for (const payment of pendingPayments) {
      const plan = RobokassaService.getPlanById(payment.plan_id)
      if (!plan) {
        console.error('Plan not found:', payment.plan_id)
        continue
      }

      // Добавляем интервью
      totalInterviewsAdded += plan.interviews

      // Обновляем статус платежа
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          payment_method: 'manual_sync',
          completed_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      if (updateError) {
        console.error('Error updating payment:', updateError)
      } else {
        processedPayments++
        console.log(`✅ Processed payment ${payment.inv_id} for ${plan.interviews} interviews`)
      }
    }

    // Обновляем профиль пользователя
    const newMaxInterviews = profile.max_interviews + totalInterviewsAdded
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        max_interviews: newMaxInterviews
      })
      .eq('id', user.id)

    if (profileUpdateError) {
      console.error('Error updating profile:', profileUpdateError)
      return NextResponse.json(
        { error: 'Ошибка обновления профиля' },
        { status: 500 }
      )
    }

    console.log(`✅ Added ${totalInterviewsAdded} interviews to user ${user.id}. New total: ${newMaxInterviews}`)

    return NextResponse.json({
      success: true,
      message: `Обработано платежей: ${processedPayments}`,
      processedCount: processedPayments,
      interviewsAdded: totalInterviewsAdded,
      newMaxInterviews: newMaxInterviews
    })

  } catch (error) {
    console.error('Payment sync error:', error)
    return NextResponse.json(
      { error: 'Ошибка синхронизации платежей' },
      { status: 500 }
    )
  }
}