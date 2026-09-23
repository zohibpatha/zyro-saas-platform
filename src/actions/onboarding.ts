'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function submitOnboarding(formData: FormData, sessionId: string) {
  if (!sessionId) return { error: 'Invalid session' }

  const supabase = await createClient()

  // 1. Verify Session
  const { data: session, error: sessionError } = await supabase
    .from('checkout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) return { error: 'Session not found' }
  if (session.restaurant_id) return { error: 'Session already used' }
  if (session.status === 'rejected') return { error: 'Payment was rejected' }
  if (session.status !== 'ai_verified') return { error: 'Payment not yet verified. Please wait.' }

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  if (!name || !slug) return { error: 'Name and URL are required' }

  // 2. Create Restaurant with Subscription Details
  const subscriptionEndDate = new Date()
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + (session.months * 28)) // 28 days per month as requested

  const planTier = session.amount === 199 ? 'Basic' : 'Pro'

  const { data: restaurant, error: createError } = await supabase
    .from('restaurants')
    .insert({
      name,
      business_type: formData.get('business_type') as string || 'Restaurant',
      slug,
      logo_url: formData.get('logo_url') as string || null,
      primary_color: formData.get('primary_color') as string || '#111111',
      phone: session.phone_number,
      whatsapp: session.phone_number,
      owner_email: `${session.phone_number}@zairo.local`, // Dummy email since they don't sign up
      plan_tier: planTier,
      is_active: true, // Auto active based on trust
      subscription_end_date: subscriptionEndDate.toISOString()
    })
    .select()
    .single()

  if (createError) {
    if (createError.code === '23505') return { error: 'This URL is already taken' }
    return { error: createError.message }
  }

  // 3. Link session to restaurant
  await supabase
    .from('checkout_sessions')
    .update({ restaurant_id: restaurant.id })
    .eq('id', sessionId)

  // 4. Set secure cookie for auto-login to dashboard
  const cookieStore = await cookies()
  cookieStore.set('zairo_client_auth', session.phone_number, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  return { success: true, slug: restaurant.slug }
}
