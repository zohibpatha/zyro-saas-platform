import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Determine where to redirect based on user role
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email) {
        // Check if user is an admin
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', user.email)
          .single()

        if (adminUser) {
          const forwardedHost = request.headers.get('x-forwarded-host')
          if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}/admin`)
          }
          return NextResponse.redirect(`${origin}/admin`)
        }

        // Check if user is a restaurant owner
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_email', user.email)
          .limit(1)
          .single()

        if (restaurant) {
          const forwardedHost = request.headers.get('x-forwarded-host')
          if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}/dashboard`)
          }
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }

      // Default redirect
      const forwardedHost = request.headers.get('x-forwarded-host')
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
