'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRestaurant, updateRestaurant } from '@/actions/restaurant'
import ImageUpload from '@/components/image-upload'
import type { Restaurant } from '@/lib/types'
import { useRouter } from 'next/navigation'

const restaurantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  owner_email: z.string().email('Invalid email').optional().or(z.literal('')),
  google_review_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  google_maps_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  primary_color: z.string().optional(),
})

type FormValues = z.infer<typeof restaurantSchema>

export default function RestaurantForm({ restaurant, isAdmin }: { restaurant?: Restaurant, isAdmin?: boolean }) {
  const router = useRouter()
  const [logoUrl, setLogoUrl] = useState(restaurant?.logo_url || '')
  const [coverImageUrl, setCoverImageUrl] = useState(restaurant?.cover_image || '')
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant?.name || '',
      slug: restaurant?.slug || '',
      owner_email: restaurant?.owner_email || '',
      google_review_url: restaurant?.google_review_url || '',
      google_maps_url: restaurant?.google_maps_url || '',
      instagram_url: restaurant?.instagram_url || '',
      website_url: restaurant?.website_url || '',
      phone: restaurant?.phone || '',
      whatsapp: restaurant?.whatsapp || '',
      address: restaurant?.address || '',
      primary_color: restaurant?.primary_color || '#111111',
    }
  })

  const generateSlug = () => {
    const name = watch('name')
    if (name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      setValue('slug', slug, { shouldValidate: true })
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })
    if (logoUrl) formData.append('logo_url', logoUrl)
    if (coverImageUrl) formData.append('cover_image', coverImageUrl)

    try {
      if (restaurant) {
        await updateRestaurant(restaurant.id, formData)
        router.refresh()
      } else {
        await createRestaurant(formData)
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while saving.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Restaurant Name *</Label>
          <Input id="name" {...register('name')} onBlur={generateSlug} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL) *</Label>
          <div className="flex gap-2">
            <Input id="slug" {...register('slug')} />
            <Button type="button" variant="outline" onClick={generateSlug}>Generate</Button>
          </div>
          {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
        </div>

        {isAdmin && (
          <div className="space-y-2">
            <Label htmlFor="owner_email">Owner Email *</Label>
            <Input id="owner_email" type="email" {...register('owner_email')} />
            {errors.owner_email && <p className="text-red-500 text-sm">{errors.owner_email.message}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input id="whatsapp" {...register('whatsapp')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_url">Website URL</Label>
          <Input id="website_url" {...register('website_url')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram_url">Instagram URL</Label>
          <Input id="instagram_url" {...register('instagram_url')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="google_maps_url">Google Maps URL</Label>
          <Input id="google_maps_url" {...register('google_maps_url')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="google_review_url">Google Review URL</Label>
          <Input id="google_review_url" {...register('google_review_url')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_color">Primary Color</Label>
          <div className="flex gap-2">
            <Input id="primary_color" type="color" className="w-16 h-10 p-1" {...register('primary_color')} />
            <Input type="text" {...register('primary_color')} />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register('address')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        <div className="space-y-2">
          <Label>Logo Image</Label>
          <ImageUpload 
            currentUrl={logoUrl} 
            onUpload={setLogoUrl} 
            restaurantId={restaurant?.id} 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Cover Image</Label>
          <ImageUpload 
            currentUrl={coverImageUrl} 
            onUpload={setCoverImageUrl} 
            restaurantId={restaurant?.id} 
          />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
        {isLoading ? 'Saving...' : (restaurant ? 'Update Restaurant' : 'Create Restaurant')}
      </Button>
    </form>
  )
}
