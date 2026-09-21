'use server'

import { createClient } from "@/lib/supabase/server"

export async function claimLoyaltyStamp(
  restaurantId: string, 
  phone: string, 
  vipDetails?: { name?: string, dob?: string, anniversary?: string }
) {
  const supabase = await createClient()
  const cleanPhone = phone.replace(/\D/g, '') // Keep only digits

  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, error: 'Please enter a valid phone number' }
  }

  // Check if customer exists
  const { data: existingCustomer, error: fetchError } = await supabase
    .from('loyalty_customers')
    .select('id, visits, last_visit')
    .eq('restaurant_id', restaurantId)
    .eq('phone', cleanPhone)
    .maybeSingle()

  if (fetchError) {
    return { success: false, error: 'Failed to fetch customer data' }
  }

  if (existingCustomer) {
    // Check cooldown (12 hours) to prevent fraud
    const lastVisitDate = new Date(existingCustomer.last_visit)
    const now = new Date()
    const diffHours = Math.abs(now.getTime() - lastVisitDate.getTime()) / 36e5;
    
    if (diffHours < 12) {
      return { success: false, error: 'You have already claimed a stamp today! Please try again on your next visit.' }
    }

    // Increment visit
    const updatePayload: any = {
      visits: existingCustomer.visits + 1,
      last_visit: new Date().toISOString()
    }
    
    // Update VIP details if provided
    if (vipDetails?.name) updatePayload.customer_name = vipDetails.name
    if (vipDetails?.dob) updatePayload.dob = vipDetails.dob
    if (vipDetails?.anniversary) updatePayload.anniversary = vipDetails.anniversary

    const { data: updated, error: updateError } = await supabase
      .from('loyalty_customers')
      .update(updatePayload)
      .eq('id', existingCustomer.id)
      .select('visits')
      .single()

    if (updateError) return { success: false, error: 'Failed to update stamp' }
    return { success: true, visits: updated.visits, isNew: false }
  } else {
    // Create new customer
    const insertPayload: any = { 
      restaurant_id: restaurantId, 
      phone: cleanPhone, 
      visits: 1 
    }
    
    if (vipDetails?.name) insertPayload.customer_name = vipDetails.name
    if (vipDetails?.dob) insertPayload.dob = vipDetails.dob
    if (vipDetails?.anniversary) insertPayload.anniversary = vipDetails.anniversary

    const { data: inserted, error: insertError } = await supabase
      .from('loyalty_customers')
      .insert([insertPayload])
      .select('visits')
      .single()

    if (insertError) return { success: false, error: 'Failed to create loyalty profile' }
    return { success: true, visits: inserted.visits, isNew: true }
  }
}

export async function checkLoyaltyStatus(restaurantId: string, phone: string) {
  const supabase = await createClient()
  const cleanPhone = phone.replace(/\D/g, '')

  const { data: customer } = await supabase
    .from('loyalty_customers')
    .select('visits')
    .eq('restaurant_id', restaurantId)
    .eq('phone', cleanPhone)
    .maybeSingle()

  return { visits: customer?.visits || 0 }
}
