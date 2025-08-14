import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Проверяем, есть ли уже обратная связь от этого пользователя
    const { data, error } = await supabase
      .from('feedback')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking feedback:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ hasSubmitted: !!data })
  } catch (error) {
    console.error('Error in check-feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}