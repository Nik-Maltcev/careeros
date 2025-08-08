import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { RobokassaService } from '@/lib/robokassa'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const invId = parseInt(searchParams.get('inv_id') || '0')
  
  if (!invId) {
    return NextResponse.json({ error: 'inv_id parameter required' }, { status: 400 })
  }
  
  console.log('🧪 Test payment processing for inv_id:', invId)
  
  try {
    // Найти платеж
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('inv_id', invId)
      .single()
    
    if (paymentError || !payment) {
      console.log('❌ Payment not found:', paymentError)
      return NextResponse.json({ error: 'Payment not found', details: paymentError }, { status: 404 })
    }
    
    console.log('📋 Found payment:', payment)
    
    // Проверить план
    const plan = RobokassaService.getPlanById(payment.plan_id)
    if (!plan) {
      console.log('❌ Plan not found:', payment.plan_id)
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }
    
    console.log('📋 Found plan:', plan)
    
    // Найти пользователя
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', payment.user_id)
      .single()
    
    if (profileError || !profile) {
      console.log('❌ Profile not found:', profileError)
      return NextResponse.json({ error: 'Profile not found', details: profileError }, { status: 404 })
    }
    
    console.log('👤 Found profile:', profile)
    
    // Обновить интервью
    const newMaxInterviews = profile.max_interviews + plan.interviews
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ max_interviews: newMaxInterviews })
      .eq('id', payment.user_id)
    
    if (updateError) {
      console.log('❌ Error updating profile:', updateError)
      return NextResponse.json({ error: 'Error updating profile', details: updateError }, { status: 500 })
    }
    
    console.log('✅ Updated profile interviews:', { old: profile.max_interviews, new: newMaxInterviews })
    
    // Обновить статус платежа
    const { error: statusError } = await supabase
      .from('payments')
      .update({ 
        status: 'completed',
        payment_method: 'manual_test',
        completed_at: new Date().toISOString()
      })
      .eq('inv_id', invId)
    
    if (statusError) {
      console.log('❌ Error updating payment status:', statusError)
      return NextResponse.json({ error: 'Error updating payment status', details: statusError }, { status: 500 })
    }
    
    console.log('✅ Payment processing completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      payment: payment,
      plan: plan,
      profile: profile,
      newMaxInterviews: newMaxInterviews
    })
    
  } catch (error) {
    console.error('❌ Test payment processing error:', error)
    return NextResponse.json({ error: 'Processing failed', details: error }, { status: 500 })
  }
}