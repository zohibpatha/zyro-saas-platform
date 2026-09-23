'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

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
  const rawSlug = formData.get('slug') as string

  if (!name || !rawSlug) return { error: 'Name and URL are required' }

  // Sanitize slug
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (slug.length < 3) return { error: 'URL slug must be at least 3 characters' }

  // 2. Create Restaurant with Subscription Details & Referral Tracking
  const subscriptionEndDate = new Date()
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + (session.months * 28)) // 28 days per month

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
      owner_email: `${session.phone_number}@zairo.local`,
      plan_tier: planTier,
      is_active: true,
      subscription_end_date: subscriptionEndDate.toISOString(),
      referred_by_code: session.saarthi_code || null
    })
    .select()
    .single()

  if (createError) {
    if (createError.code === '23505') return { error: 'This URL is already taken. Please choose another.' }
    return { error: createError.message }
  }

  // 3. Link session to restaurant
  await supabase
    .from('checkout_sessions')
    .update({ restaurant_id: restaurant.id })
    .eq('id', sessionId)

  // 4. Link payment_audits to restaurant
  await supabase
    .from('payment_audits')
    .update({ restaurant_id: restaurant.id })
    .eq('session_id', sessionId)

  // 5. Set secure cookie for auto-login to dashboard
  const cookieStore = await cookies()
  cookieStore.set('zairo_client_auth', session.phone_number, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  return { success: true, slug: restaurant.slug }
}
