import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, userName, stage, purpose, liked, improvements } = await request.json()

    if (!userId || !stage || !purpose || !liked || !improvements) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Проверяем, не отправлял ли пользователь уже обратную связь
    const { data: existingFeedback } = await supabase
      .from('feedback')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingFeedback) {
      return NextResponse.json({ error: 'Вы уже отправляли обратную связь' }, { status: 400 })
    }

    // Сохраняем обратную связь
    const { error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        stage: stage,
        purpose: purpose,
        liked: liked,
        improvements: improvements,
        created_at: new Date().toISOString()
      })

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError)
      return NextResponse.json({ error: 'Ошибка сохранения обратной связи' }, { status: 500 })
    }

    // Начисляем +1 интервью пользователю
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        max_interviews: supabase.raw('max_interviews + 1')
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user interviews:', updateError)
      // Не возвращаем ошибку, так как обратная связь уже сохранена
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in submit-feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}