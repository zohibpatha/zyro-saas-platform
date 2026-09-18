'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Using the standard client since we handle logic via RPCs and open storage policies
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function updateRestaurantBySlug(slug: string, formData: FormData) {
  const { error } = await supabase.rpc('update_restaurant_magic', {
    p_slug: slug,
    p_name: formData.get('name') as string,
    p_business_type: formData.get('business_type') as string,
    p_logo_url: formData.get('logo_url') as string || null,
    p_cover_image: formData.get('cover_image') as string || null,
    p_instagram_url: formData.get('instagram_url') as string || null,
    p_google_maps_url: formData.get('google_maps_url') as string || null,
    p_google_review_url: formData.get('google_review_url') as string || null,
    p_website_url: formData.get('website_url') as string || null,
    p_phone: formData.get('phone') as string || null,
    p_whatsapp: formData.get('whatsapp') as string || null,
    p_address: formData.get('address') as string || null,
    p_primary_color: (formData.get('primary_color') as string) || '#111111',
    p_loyalty_offer: formData.get('loyalty_offer') as string || null,
    p_reward_stamps: parseInt(formData.get('reward_stamps') as string || '5', 10)
  })

  if (error) return { error: error.message }

  revalidatePath('/manage/' + slug)
  revalidatePath('/r/' + slug)
  return { success: true }
}

export async function addFoodPhotoBySlug(slug: string, imageUrl: string) {
  const { data, error } = await supabase.rpc('add_food_photo_magic', {
    p_slug: slug,
    p_image_url: imageUrl
  })

  if (error) return { error: error.message }

  revalidatePath('/manage/' + slug)
  revalidatePath('/r/' + slug)
  return { success: true, photo: data }
}

export async function deleteFoodPhotoBySlug(photoId: string, slug: string) {
  const { error } = await supabase.rpc('delete_food_photo_magic', {
    p_photo_id: photoId,
    p_slug: slug
  })

  if (error) return { error: error.message }

  revalidatePath('/manage/' + slug)
  revalidatePath('/r/' + slug)
  return { success: true }
}

export async function uploadImagePublic(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get('file') as File
  const slug = formData.get('slug') as string || 'general'
  if (!file) return { error: 'No file provided' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${slug}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { error } = await supabase.storage
    .from('restaurant-assets')
    .upload(fileName, file)

  if (error) return { error: error.message }

  const { data: publicData } = supabase.storage
    .from('restaurant-assets')
    .getPublicUrl(fileName)

  return { url: publicData.publicUrl }
}
