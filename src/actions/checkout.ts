'use server'

import { createClient } from '@/lib/supabase/server'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
    + '-' + Math.random().toString(36).substring(2, 6)
}

export async function submitManualPayment(formData: FormData) {
  const supabase = await createClient()
  
  // Extract business details
  const businessName = formData.get('business_name') as string
  const businessType = formData.get('business_type') as string
  const googleReviewUrl = formData.get('google_review_url') as string
  const googleMapsUrl = formData.get('google_maps_url') as string || null
  const instagramUrl = formData.get('instagram_url') as string || null
  const websiteUrl = formData.get('website_url') as string || null
  const whatsapp = formData.get('whatsapp') as string
  const utr = formData.get('utr') as string
  const plan = formData.get('plan') as string || 'pro'

  if (!businessName || !whatsapp || !utr || !googleReviewUrl) {
    return { error: 'Please fill in all required fields.' }
  }

  const slug = generateSlug(businessName)

  // 1. Save payment record
  await supabase
    .from('manual_payments')
    .insert({
      utr_number: utr,
      whatsapp_number: whatsapp,
      plan_id: plan,
      amount: '999',
      status: 'pending'
    })

  // 2. Auto-create the business (restaurant entry)
  // Use whatsapp as a temporary owner_email identifier
  const ownerIdentifier = whatsapp.replace(/[^0-9]/g, '') + '@zyro.app'
  
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .insert({
      name: businessName,
      business_type: businessType || 'Restaurant',
      slug,
      google_review_url: googleReviewUrl,
      google_maps_url: googleMapsUrl,
      instagram_url: instagramUrl,
      website_url: websiteUrl,
      whatsapp: whatsapp,
      owner_email: ownerIdentifier,
      primary_color: '#111111',
      is_active: true,
    })
    .select('id, slug')
    .single()

  if (restaurantError) {
    console.error('Error creating business:', restaurantError)
    return { error: 'Failed to create your business. Please try again or contact support.' }
  }

  // 3. Generate the URLs
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const qrPageUrl = `${siteUrl}/r/${restaurant.slug}`
  const dashboardUrl = `${siteUrl}/r/${restaurant.slug}` // Public QR page as their "dashboard" for now

  return { 
    success: true, 
    dashboardUrl,
    qrPageUrl,
  }
}
