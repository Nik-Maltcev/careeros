import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
  }
  
  try {
    // Ищем пользователя в auth.users через admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users', details: error }, { status: 500 })
    }
    
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Проверяем, есть ли профиль
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        created_at: user.created_at
      },
      profile: profile,
      profileError: profileError?.message
    })
    
  } catch (error) {
    console.error('Find user error:', error)
    return NextResponse.json({ error: 'Exception occurred', details: error }, { status: 500 })
  }
}