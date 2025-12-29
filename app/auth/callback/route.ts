import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Se for recuperacao de senha, redirecionar para reset-password
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // Caso contrario, redirecionar para o destino
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirecionar para pagina de erro se algo der errado
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
