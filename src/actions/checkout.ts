'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitManualPayment(formData: FormData) {
  const supabase = await createClient()
  const utr = formData.get('utr') as string
  const whatsapp = formData.get('whatsapp') as string
  
  if (!utr || !whatsapp) {
    return { error: 'UTR and WhatsApp number are required' }
  }
  
  const { error } = await supabase
    .from('manual_payments')
    .insert([
      {
        upi_id: 'your-upi-id@bank',
        amount: 1398,
        utr,
        whatsapp,
        status: 'pending'
      }
    ])
    
  if (error) {
    console.error('Error inserting manual payment:', error)
    return { error: 'Failed to submit payment details. Please try again.' }
  }
  
  return { success: true }
}
