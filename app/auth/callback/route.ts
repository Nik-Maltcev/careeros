import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/?error=auth_error', request.url))
      }

      // Успешная авторизация - перенаправляем на главную
      return NextResponse.redirect(new URL('/?success=email_confirmed', request.url))
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/?error=auth_error', request.url))
    }
  }

  // Если нет кода, перенаправляем на главную
  return NextResponse.redirect(new URL('/', request.url))
}