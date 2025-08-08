import { NextRequest, NextResponse } from 'next/server'
import { RobokassaService } from '@/lib/robokassa'
import { supabase } from '@/lib/supabase'

// Общая функция для обработки уведомлений от Robokassa
async function processPaymentNotification(data: {
  outSum: number
  invId: number
  signatureValue: string
  email: string
  paymentMethod: string
  fee: number
}) {
  const { outSum, invId, signatureValue, email, paymentMethod, fee } = data
  
  console.log('🔔 Processing payment notification:', { outSum, invId, signatureValue })
  
  // Проверяем подпись БЕЗ пользовательских параметров (минимальная версия)
  // Пропускаем проверку подписи для ручной обработки
  if (signatureValue !== 'manual') {
    let signatureString = `${outSum}:${invId}:${process.env.ROBOKASSA_PASSWORD_2}`
    
    const expectedSignature = require('crypto').createHash('md5').update(signatureString).digest('hex').toUpperCase()
    const isValidSignature = expectedSignature === signatureValue.toUpperCase()
    
    console.log('🔐 Signature verification:', {
      outSum,
      invId,
      signatureString,
      expectedSignature,
      receivedSignature: signatureValue,
      isValid: isValidSignature
    })

    if (!isValidSignature) {
      console.error('❌ Invalid signature from Robokassa')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    console.log('🔧 Manual processing - skipping signature verification')
  }

  // Ищем информацию о платеже по invId в таблице payments
  try {
    const { data: existingPayment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('inv_id', invId)
      .single()

    if (paymentError || !existingPayment) {
      console.error('❌ Payment not found:', paymentError)
      // Все равно возвращаем OK, чтобы Robokassa не повторяла запрос
      return new NextResponse(`OK${invId}`, { status: 200 })
    }

    // Проверяем, что платеж еще не обработан
    if (existingPayment.status === 'completed') {
      console.log('✅ Payment already processed:', invId)
      return new NextResponse(`OK${invId}`, { status: 200 })
    }

    const plan = RobokassaService.getPlanById(existingPayment.plan_id)
    if (!plan) {
      console.error('❌ Plan not found:', existingPayment.plan_id)
      return new NextResponse(`OK${invId}`, { status: 200 })
    }

    // Обновляем баланс интервью пользователя
    if (existingPayment.user_id) {
      try {
        console.log('🔍 Looking for user profile:', existingPayment.user_id)
        
        // Получаем текущий профиль пользователя
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', existingPayment.user_id)
          .single()

        console.log('👤 Profile query result:', { profile, profileError })

        if (profileError) {
          console.error('❌ Error fetching user profile:', profileError)
        } else if (profile) {
          const newMaxInterviews = profile.max_interviews + plan.interviews
          console.log('📊 Updating interviews:', { 
            current: profile.max_interviews, 
            adding: plan.interviews, 
            new: newMaxInterviews 
          })
          
          // Обновляем количество доступных интервью
          const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({
              max_interviews: newMaxInterviews
            })
            .eq('id', existingPayment.user_id)
            .select()

          console.log('💾 Update result:', { updateData, updateError })

          if (updateError) {
            console.error('❌ Error updating user interviews:', updateError)
          } else {
            console.log(`✅ Added ${plan.interviews} interviews to user ${existingPayment.user_id}. New total: ${newMaxInterviews}`)
          }
        } else {
          console.error('❌ Profile not found for user:', existingPayment.user_id)
        }
      } catch (error) {
        console.error('❌ Error processing user payment:', error)
      }
    } else {
      console.error('❌ No user_id in payment:', existingPayment)
    }

    // Обновляем статус платежа на завершенный
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        fee: fee,
        payment_method: paymentMethod,
        completed_at: new Date().toISOString()
      })
      .eq('inv_id', invId)

    if (updateError) {
      console.error('❌ Error updating payment status:', updateError)
    } else {
      console.log('✅ Payment completed successfully:', invId)
    }

  } catch (error) {
    console.error('❌ Error processing payment result:', error)
  }

  // Возвращаем подтверждение для Robokassa
  return new NextResponse(`OK${invId}`, { status: 200 })
}

// GET обработчик - может использоваться Robokassa для уведомлений
export async function GET(request: NextRequest) {
  console.log('🔍 GET request to payment result endpoint')
  
  const { searchParams } = new URL(request.url)
  
  // Если есть параметры платежа, обрабатываем как уведомление от Robokassa
  if (searchParams.has('OutSum') && searchParams.has('InvId')) {
    console.log('📨 Processing Robokassa notification via GET')
    
    const outSum = parseFloat(searchParams.get('OutSum') || '0')
    const invId = parseInt(searchParams.get('InvId') || '0')
    const signatureValue = searchParams.get('SignatureValue') || ''
    const email = searchParams.get('EMail') || ''
    const paymentMethod = searchParams.get('PaymentMethod') || ''
    const fee = parseFloat(searchParams.get('Fee') || '0')
    
    console.log('📋 GET notification data:', {
      outSum, invId, signatureValue, email, paymentMethod, fee
    })
    
    // Используем ту же логику обработки, что и для POST
    return await processPaymentNotification({
      outSum, invId, signatureValue, email, paymentMethod, fee
    })
  }
  
  // Проверяем, есть ли параметр для ручной обработки платежа
  if (searchParams.has('manual_process')) {
    const invId = parseInt(searchParams.get('manual_process') || '0')
    console.log('🔧 Manual payment processing requested for inv_id:', invId)
    
    if (invId) {
      console.log('🔧 Starting manual processing for inv_id:', invId)
      // Имитируем успешное уведомление от Robokassa для ручной обработки
      const result = await processPaymentNotification({
        outSum: 0, // Будет взято из базы данных
        invId: invId,
        signatureValue: 'manual', // Пропускаем проверку подписи для ручной обработки
        email: '',
        paymentMethod: 'manual',
        fee: 0
      })
      console.log('🔧 Manual processing result:', result)
      return result
    } else {
      console.log('❌ Invalid inv_id for manual processing:', invId)
      return NextResponse.json({ error: 'Invalid inv_id' }, { status: 400 })
    }
  }
  
  // Иначе это тестовый запрос - показываем статус платежей
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    console.log('📋 Recent payments:', payments)
    
    return NextResponse.json({ 
      message: 'Payment result endpoint is working',
      timestamp: new Date().toISOString(),
      recentPayments: payments,
      error: error?.message,
      manualProcessingHelp: 'To manually process a payment, add ?manual_process=INV_ID to the URL'
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ 
      message: 'Payment result endpoint is working',
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch payments'
    })
  }
}

export async function POST(request: NextRequest) {
  console.log('🔔 Payment result callback received!')
  
  try {
    const formData = await request.formData()
    
    // Логируем все полученные данные
    const allData: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      allData[key] = value
    }
    console.log('📋 All form data received:', allData)
    
    const outSum = parseFloat(formData.get('OutSum') as string)
    const invId = parseInt(formData.get('InvId') as string)
    const signatureValue = formData.get('SignatureValue') as string
    const email = formData.get('EMail') as string
    const paymentMethod = formData.get('PaymentMethod') as string
    const fee = parseFloat(formData.get('Fee') as string || '0')
    
    // Проверяем подпись БЕЗ пользовательских параметров (минимальная версия)
    let signatureString = `${outSum}:${invId}:${process.env.ROBOKASSA_PASSWORD_2}`
    
    const expectedSignature = require('crypto').createHash('md5').update(signatureString).digest('hex').toUpperCase()
    const isValidSignature = expectedSignature === signatureValue.toUpperCase()
    
    console.log('Result signature verification:', {
      outSum,
      invId,
      signatureString,
      expectedSignature,
      receivedSignature: signatureValue,
      isValid: isValidSignature
    })

    if (!isValidSignature) {
      console.error('Invalid signature from Robokassa')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Ищем информацию о платеже по invId в таблице payments
    try {
      const { data: existingPayment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('inv_id', invId)
        .single()

      if (paymentError || !existingPayment) {
        console.error('Payment not found:', paymentError)
        // Все равно возвращаем OK, чтобы Robokassa не повторяла запрос
        return new NextResponse(`OK${invId}`, { status: 200 })
      }

      // Проверяем, что платеж еще не обработан
      if (existingPayment.status === 'completed') {
        console.log('Payment already processed:', invId)
        return new NextResponse(`OK${invId}`, { status: 200 })
      }

      const plan = RobokassaService.getPlanById(existingPayment.plan_id)
      if (!plan) {
        console.error('Plan not found:', existingPayment.plan_id)
        return new NextResponse(`OK${invId}`, { status: 200 })
      }

      // Обновляем баланс интервью пользователя
      if (existingPayment.user_id) {
        try {
          // Получаем текущий профиль пользователя
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingPayment.user_id)
            .single()

          if (profileError) {
            console.error('Error fetching user profile:', profileError)
          } else if (profile) {
            // Обновляем количество доступных интервью
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                max_interviews: profile.max_interviews + plan.interviews
              })
              .eq('id', existingPayment.user_id)

            if (updateError) {
              console.error('Error updating user interviews:', updateError)
            } else {
              console.log(`Added ${plan.interviews} interviews to user ${existingPayment.user_id}`)
            }
          }
        } catch (error) {
          console.error('Error processing user payment:', error)
        }
      }

      // Обновляем статус платежа на завершенный
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          fee: fee,
          payment_method: paymentMethod,
          completed_at: new Date().toISOString()
        })
        .eq('inv_id', invId)

      if (updateError) {
        console.error('Error updating payment status:', updateError)
      } else {
        console.log('Payment completed successfully:', invId)
      }

    } catch (error) {
      console.error('Error processing payment result:', error)
    }

    // Возвращаем подтверждение для Robokassa
    return new NextResponse(`OK${invId}`, { status: 200 })

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}