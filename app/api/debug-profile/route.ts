import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id') || '9ea770b7-942c-4f78-b65b-001707d60550'
  
  // Если параметр list=true, показываем все профили
  if (searchParams.get('list') === 'true') {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10)
      
      return NextResponse.json({
        message: 'All profiles',
        profiles: profiles,
        error: error
      })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch profiles', details: error })
    }
  }
  
  // Если параметр create=true, создаем профиль
  if (searchParams.get('create') === 'true') {
    try {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'nikmaltcev98@gmail.com',
          name: 'Ник',
          max_interviews: 1,
          interviews_used: 10,
          plan: 'free',
          created_at: new Date().toISOString()
        })
        .select()
      
      return NextResponse.json({
        message: 'Profile created',
        profile: newProfile,
        error: createError
      })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to create profile', details: error })
    }
  }
  
  try {
    console.log('🔍 Looking for user profile:', userId)
    
    // Получаем профиль
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    console.log('👤 Profile query result:', { profile, profileError })
    
    if (profileError) {
      return NextResponse.json({ 
        error: 'Profile not found', 
        details: profileError,
        userId: userId
      }, { status: 404 })
    }
    
    if (!profile) {
      return NextResponse.json({ 
        error: 'Profile is null', 
        userId: userId
      }, { status: 404 })
    }
    
    // Пробуем обновить профиль
    const newMaxInterviews = profile.max_interviews + 1
    console.log('📊 Trying to update interviews:', { 
      current: profile.max_interviews, 
      new: newMaxInterviews 
    })
    
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        max_interviews: newMaxInterviews
      })
      .eq('id', userId)
      .select()
    
    console.log('💾 Update result:', { updateData, updateError })
    
    if (updateError) {
      return NextResponse.json({ 
        error: 'Update failed', 
        details: updateError,
        profile: profile,
        attemptedValue: newMaxInterviews
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      oldProfile: profile,
      newMaxInterviews: newMaxInterviews,
      updateResult: updateData
    })
    
  } catch (error) {
    console.error('❌ Debug profile error:', error)
    return NextResponse.json({ 
      error: 'Exception occurred', 
      details: error,
      userId: userId
    }, { status: 500 })
  }
}