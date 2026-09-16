'use server'

import { createClient } from "@/lib/supabase/server"

export async function submitPrivateFeedback(restaurantId: string, rating: number, message: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('private_feedback')
    .insert([
      { restaurant_id: restaurantId, rating, message }
    ])

  if (error) {
    console.error('Error submitting feedback:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
