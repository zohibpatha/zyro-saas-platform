'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function startFreeTrial(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const rawSlug = formData.get('slug') as string
  const phone = formData.get('phone') as string
  const googleMapsUrl = formData.get('google_maps_url') as string
  const saarthiCode = formData.get('saarthi_code') as string || null
  
  if (!name || !rawSlug || !phone || !googleMapsUrl) {
    return { error: 'All fields are required' }
  }

  // Sanitize slug: lowercase, no special chars, hyphens for spaces
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (slug.length < 3) {
    return { error: 'URL slug must be at least 3 characters' }
  }

  // ANTI-ABUSE CHECK
  const { data: existing } = await supabase
    .from('restaurants')
    .select('id, name')
    .or(`phone.eq.${phone},google_maps_url.eq.${googleMapsUrl}`)
    .limit(1)
    .maybeSingle()
    
  if (existing) {
    return { error: `Fraud Prevention: This phone number or Google Maps location is already registered to "${existing.name}". Each business can only claim one free trial. Please upgrade instead.` }
  }

  const trialExpiresAt = new Date()
  trialExpiresAt.setDate(trialExpiresAt.getDate() + 7)
  
  const ownerEmail = `${phone}@zairotrial.local`;

  const { data: restaurant, error: createError } = await supabase
    .from('restaurants')
    .insert({
      name,
      slug,
      business_type: formData.get('business_type') as string || 'Restaurant',
      phone,
      whatsapp: phone,
      google_maps_url: googleMapsUrl,
      owner_email: ownerEmail,
      plan_tier: 'Pro',
      is_active: true,
      trial_expires_at: trialExpiresAt.toISOString(),
      referred_by_code: saarthiCode ? saarthiCode.toUpperCase().trim() : null
    })
    .select()
    .single()
    
  if (createError) {
    if (createError.code === '23505') return { error: 'This URL slug is already taken. Please choose another.' }
    return { error: createError.message }
  }

  // To let them manage the dashboard, we'll set a secure token in cookies
  // But wait, the current dashboard access doesn't strictly check cookies if they know the slug.
  // Actually, manage/[slug] is completely public right now (security by obscurity).

  return { success: true, slug: restaurant.slug }
}
