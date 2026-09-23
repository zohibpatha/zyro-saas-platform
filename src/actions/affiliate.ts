'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAffiliateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const upi_id = formData.get('upi_id') as string
  const saarthi_code = (formData.get('saarthi_code') as string).toUpperCase()

  if (!name || !upi_id || !saarthi_code) {
    return { error: 'Please fill in all fields' }
  }

  // Check if code is taken
  const { data: existingCode } = await supabase
    .from('affiliates')
    .select('id')
    .eq('saarthi_code', saarthi_code)
    .single()

  if (existingCode) {
    return { error: 'Code already taken. Please choose another one.' }
  }

  const { error } = await supabase
    .from('affiliates')
    .insert({
      id: user.id,
      name,
      upi_id,
      saarthi_code
    })

  if (error) {
    console.error('Affiliate Creation Error:', error)
    return { error: 'Failed to create profile. Please try again.' }
  }

  revalidatePath('/partner')
  return { success: true }
}

export async function getAffiliateProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null }

  const { data, error } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Fetch Profile Error:', error)
  }

  return { data }
}

export async function getAffiliateLedger() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: [] }

  const { data, error } = await supabase
    .from('affiliate_ledger')
    .select('*')
    .eq('affiliate_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch Ledger Error:', error)
    return { data: [] }
  }

  return { data }
}

export async function requestWithdrawal() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Use service role for transactional update or just do it via normal queries
  // Fetch current balance
  const { data: profile } = await supabase
    .from('affiliates')
    .select('wallet_balance')
    .eq('id', user.id)
    .single()

  if (!profile || profile.wallet_balance < 500) {
    return { error: 'Minimum withdrawal is ₹500' }
  }

  // Check for existing pending withdrawal to prevent double-click race condition
  const { data: existingPending } = await supabase
    .from('affiliate_ledger')
    .select('id')
    .eq('affiliate_id', user.id)
    .eq('type', 'withdrawal')
    .eq('status', 'pending')
    .limit(1)
    .maybeSingle()

  if (existingPending) {
    return { error: 'You already have a pending withdrawal. Please wait for it to be processed.' }
  }

  const amount = profile.wallet_balance

  // Create withdrawal request
  const { error: ledgerError } = await supabase
    .from('affiliate_ledger')
    .insert({
      affiliate_id: user.id,
      amount: -amount,
      type: 'withdrawal',
      description: 'Withdrawal Request',
      status: 'pending'
    })

  if (ledgerError) {
    return { error: 'Failed to create request' }
  }

  // Deduct from wallet balance
  const { error: updateError } = await supabase
    .from('affiliates')
    .update({ wallet_balance: 0 })
    .eq('id', user.id)

  if (updateError) {
    return { error: 'Failed to update balance' }
  }

  revalidatePath('/partner')
  return { success: true }
}

// Super Admin Functions
export async function getAllPendingWithdrawals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { data: [] }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle()

  if (!admin) return { data: [] }

  const { data, error } = await supabase
    .from('affiliate_ledger')
    .select(`
      *,
      affiliates (
        name,
        upi_id,
        saarthi_code
      )
    `)
    .eq('type', 'withdrawal')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch Withdrawals Error:', error)
    return { data: [] }
  }

  return { data }
}

export async function markWithdrawalPaid(ledgerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Unauthorized' }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle()

  if (!admin) return { error: 'Admin access required' }

  const { error } = await supabase
    .from('affiliate_ledger')
    .update({ status: 'completed' })
    .eq('id', ledgerId)

  if (error) return { error: error.message }
  
  revalidatePath('/zairo-super-admin-786')
  return { success: true }
}
