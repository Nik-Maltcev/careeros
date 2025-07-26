import { NextRequest, NextResponse } from 'next/server'
import { RobokassaService } from '@/lib/robokassa'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const outSum = parseFloat(formData.get('OutSum') as string)
    const invId = parseInt(formData.get('InvId') as string)
    const signatureValue = formData.get('SignatureValue') as string
    const email = formData.get('EMail') as string
    const paymentMethod = formData.get('PaymentMethod') as string
    const fee = parseFloat(formData.get('Fee') as string || '0')
    
    // Получаем пользовательские параметры
    const shpPlan = formData.get('Shp_plan') as string
    const shpInterviews = formData.get('Shp_interviews') as string
    const shpUserId = formData.get('Shp_user_id') as string

    const shpParams: Record<string, string> = {}
    if (shpPlan) shpParams.shp_plan = shpPlan
    if (shpInterviews) shpParams.shp_interviews = shpInterviews
    if (shpUserId) shpParams.shp_user_id = shpUserId

    // Проверяем подпись как в Python примере: OutSum:InvId:Password2
    let signatureString = `${outSum}:${invId}:${process.env.ROBOKASSA_PASSWORD_2}`
    
    // Добавляем пользовательские параметры в алфавитном порядке
    if (Object.keys(shpParams).length > 0) {
      const sortedKeys = Object.keys(shpParams).sort()
      for (const key of sortedKeys) {
        signatureString += `:${key}=${shpParams[key]}`
      }
    }
    
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

    // Обрабатываем успешный платеж
    const plan = RobokassaService.getPlanById(shpPlan)
    if (!plan) {
      console.error('Plan not found:', shpPlan)
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
    }

    // Если есть пользователь, обновляем его баланс интервью
    if (shpUserId) {
      try {
        // Получаем текущий профиль пользователя
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', shpUserId)
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
            .eq('id', shpUserId)

          if (updateError) {
            console.error('Error updating user interviews:', updateError)
          } else {
            console.log(`Added ${plan.interviews} interviews to user ${shpUserId}`)
          }
        }
      } catch (error) {
        console.error('Error processing user payment:', error)
      }
    }

    // Сохраняем информацию о платеже (опционально)
    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          inv_id: invId,
          user_id: shpUserId || null,
          plan_id: shpPlan,
          amount: outSum,
          fee: fee,
          email: email,
          payment_method: paymentMethod,
          status: 'completed',
          created_at: new Date().toISOString()
        })

      if (paymentError) {
        console.error('Error saving payment info:', paymentError)
      }
    } catch (error) {
      console.error('Error saving payment:', error)
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