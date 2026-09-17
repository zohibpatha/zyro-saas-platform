'use server'

import { createClient } from '@/lib/supabase/server'

function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

export async function submitManualPayment(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // Extract business details
    const businessName = (formData.get('business_name') as string)?.trim()
    const businessType = formData.get('business_type') as string
    const googleReviewUrl = (formData.get('google_review_url') as string)?.trim()
    const googleMapsUrl = formData.get('google_maps_url') as string || null
    const instagramUrl = formData.get('instagram_url') as string || null
    const websiteUrl = formData.get('website_url') as string || null
    const whatsapp = (formData.get('whatsapp') as string)?.trim()
    const utr = formData.get('utr') as string || 'not-provided'
    const plan = formData.get('plan') as string || 'pro'

    if (!businessName || !whatsapp || !googleReviewUrl) {
      return { error: 'Please fill in all required fields.' }
    }

    // Generate base slug
    const baseSlug = generateSlug(businessName)
    let slug = baseSlug
    let isUnique = false
    let attempts = 0
    
    while (!isUnique && attempts < 5) {
      if (attempts > 0) {
         slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
      }
      const { data: existing, error: checkError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
        
      if (checkError) {
        console.error('Error checking slug:', checkError)
        return { error: 'Failed to verify business URL. Please try again.' }
      }
      
      if (!existing) {
        isUnique = true
      } else {
        attempts++
      }
    }
    
    if (!isUnique) {
      return { error: 'Could not generate a unique business URL. Please try a different name.' }
    }

    // 1. Save payment record
    const { error: paymentError } = await supabase
      .from('manual_payments')
      .insert({
        utr_number: utr,
        whatsapp_number: whatsapp,
        plan_id: plan,
        amount: '999',
        status: 'pending'
      })

    if (paymentError) {
      console.error('Payment Error:', paymentError)
      return { error: 'Failed to record payment. Please try again.' }
    }

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
    const dashboardUrl = `${siteUrl}/manage/${restaurant.slug}`

    return { 
      success: true, 
      dashboardUrl,
      qrPageUrl,
    }
  } catch (err) {
    console.error('Unhandled error in submitManualPayment:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}
