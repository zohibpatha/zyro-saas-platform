'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, admin: null }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email!)
    .maybeSingle()

  return { user, admin }
}

async function verifyAdminOrOwner(restaurantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, isAuthorized: false }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email!)
    .maybeSingle()

  if (admin) return { user, isAuthorized: true }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('owner_email')
    .eq('id', restaurantId)
    .maybeSingle()

  if (restaurant?.owner_email === user.email) return { user, isAuthorized: true }

  return { user, isAuthorized: false }
}

export async function createRestaurant(formData: FormData) {
  const { user, admin } = await verifyAdmin()
  if (!user) return { error: 'Unauthorized' }
  if (!admin) return { error: 'Admin access required' }

  const supabase = await createClient()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  const { error } = await supabase.from('restaurants').insert({
    name,
    business_type: formData.get('business_type') as string,
    slug,
    logo_url: formData.get('logo_url') as string || null,
    cover_image: formData.get('cover_image') as string || null,
    instagram_url: formData.get('instagram_url') as string || null,
    google_maps_url: formData.get('google_maps_url') as string || null,
    google_review_url: formData.get('google_review_url') as string || null,
    website_url: formData.get('website_url') as string || null,
    phone: formData.get('phone') as string || null,
    whatsapp: formData.get('whatsapp') as string || null,
    address: formData.get('address') as string || null,
    primary_color: (formData.get('primary_color') as string) || '#111111',
    loyalty_offer: formData.get('loyalty_offer') as string || null,
    reward_stamps: parseInt(formData.get('reward_stamps') as string || '5', 10),
    plan_tier: formData.get('plan_tier') as string || 'Pro',
    menu_url: formData.get('menu_url') as string || null,
    owner_email: (formData.get('owner_email') as string) || user.email,
  })

  if (error) return { error: error.message }

  revalidatePath('/zairo-super-admin-786')
  return { success: true }
}

export async function updateRestaurant(id: string, formData: FormData) {
  const { isAuthorized } = await verifyAdminOrOwner(id)
  if (!isAuthorized) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const updateData: any = {
    name: formData.get('name') as string,
    business_type: formData.get('business_type') as string,
    slug: formData.get('slug') as string,
    logo_url: formData.get('logo_url') as string || null,
    cover_image: formData.get('cover_image') as string || null,
    instagram_url: formData.get('instagram_url') as string || null,
    google_maps_url: formData.get('google_maps_url') as string || null,
    google_review_url: formData.get('google_review_url') as string || null,
    website_url: formData.get('website_url') as string || null,
    phone: formData.get('phone') as string || null,
    whatsapp: formData.get('whatsapp') as string || null,
    address: formData.get('address') as string || null,
    primary_color: (formData.get('primary_color') as string) || '#111111',
    loyalty_offer: formData.get('loyalty_offer') as string || null,
    reward_stamps: parseInt(formData.get('reward_stamps') as string || '5', 10),
    plan_tier: formData.get('plan_tier') as string || 'Pro',
    menu_url: formData.get('menu_url') as string || null,
  }

  // Admin can change owner_email
  const ownerEmail = formData.get('owner_email') as string
  if (ownerEmail) {
    const { admin } = await verifyAdmin()
    if (admin) updateData.owner_email = ownerEmail
  }

  const { error } = await supabase
    .from('restaurants')
    .update(updateData)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/zairo-super-admin-786')
  revalidatePath(`/zairo-super-admin-786/edit/${id}`)
  return { success: true }
}

export async function toggleRestaurant(id: string) {
  const { admin } = await verifyAdmin()
  if (!admin) return { error: 'Admin access required' }

  const supabase = await createClient()
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('is_active')
    .eq('id', id)
    .maybeSingle()

  if (!restaurant) return { error: 'Not found' }

  const { error } = await supabase
    .from('restaurants')
    .update({ is_active: !restaurant.is_active })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/zairo-super-admin-786')
  return { success: true }
}

export async function deleteRestaurant(id: string) {
  const { admin } = await verifyAdmin()
  if (!admin) return { error: 'Admin access required' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/zairo-super-admin-786')
  return { success: true }
}

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File
  const restaurantId = formData.get('restaurantId') as string || 'general'
  if (!file) return { error: 'No file provided' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${restaurantId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('restaurant-assets')
    .upload(fileName, file)

  if (error) return { error: error.message }

  const { data: publicData } = supabase.storage
    .from('restaurant-assets')
    .getPublicUrl(fileName)

  return { url: publicData.publicUrl }
}

export async function addFoodPhoto(restaurantId: string, imageUrl: string) {
  const { isAuthorized } = await verifyAdminOrOwner(restaurantId)
  if (!isAuthorized) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('food_photos')
    .insert({
      restaurant_id: restaurantId,
      image_url: imageUrl,
      sort_order: 0,
    })
    .select()

  if (error) return { error: error.message }

  revalidatePath(`/zairo-super-admin-786/edit/${restaurantId}`)
  return { success: true, photo: data[0] }
}

export async function deleteFoodPhoto(photoId: string, restaurantId: string) {
  const { isAuthorized } = await verifyAdminOrOwner(restaurantId)
  if (!isAuthorized) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('food_photos')
    .delete()
    .eq('id', photoId)

  if (error) return { error: error.message }

  revalidatePath(`/zairo-super-admin-786/edit/${restaurantId}`)
  return { success: true }
}

export async function approvePaymentAudit(auditId: string) {
  const { admin } = await verifyAdmin()
  if (!admin) return { error: 'Admin access required' }
  const supabase = await createClient()
  await supabase.from('payment_audits').update({ status: 'APPROVED' }).eq('id', auditId)
  revalidatePath('/zairo-super-admin-786')
  return { success: true }
}

export async function rejectPaymentAudit(auditId: string, restaurantId: string | null) {
  const { admin } = await verifyAdmin()
  if (!admin) return { error: 'Admin access required' }
  const supabase = await createClient()

  // 1. Fetch audit details before updating
  const { data: audit } = await supabase
    .from('payment_audits')
    .select('*, restaurants(id)')
    .eq('id', auditId)
    .single()

  await supabase.from('payment_audits').update({ status: 'REJECTED' }).eq('id', auditId)

  // 2. Add 24-hour warning period instead of instant deactivation
  const targetRestId = restaurantId || audit?.restaurant_id || audit?.restaurants?.id
  const warningDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now

  if (targetRestId) {
    await supabase.from('restaurants').update({ payment_warning_until: warningDeadline }).eq('id', targetRestId)
  } else if (audit?.phone_number) {
    // If restaurant wasn't linked yet, find by phone
    await supabase.from('restaurants').update({ payment_warning_until: warningDeadline }).eq('phone', audit.phone_number)
  }

  // 3. Reverse Affiliate Commission if one was awarded
  if (audit?.affiliate_id) {
    const { data: lastLedger } = await supabase
      .from('affiliate_ledger')
      .select('amount')
      .eq('affiliate_id', audit.affiliate_id)
      .in('type', ['signup_commission', 'renewal_commission'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const commissionToDeduct = lastLedger?.amount || 100

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, wallet_balance, total_earned')
      .eq('id', audit.affiliate_id)
      .single()

    if (affiliate) {
      await supabase
        .from('affiliates')
        .update({
          wallet_balance: Math.max(0, (affiliate.wallet_balance || 0) - commissionToDeduct),
          total_earned: Math.max(0, (affiliate.total_earned || 0) - commissionToDeduct)
        })
        .eq('id', affiliate.id)

      await supabase
        .from('affiliate_ledger')
        .insert({
          affiliate_id: affiliate.id,
          amount: -commissionToDeduct,
          type: 'commission_reversal',
          description: `Payment rejected by admin for Audit #${auditId.substring(0, 8)}`,
          status: 'completed'
        })
    }
  }

  revalidatePath('/zairo-super-admin-786')
  return { success: true }
}

