'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRestaurant, updateRestaurant } from '@/actions/restaurant'
import { updateRestaurantBySlug } from '@/actions/manage'
import ImageUpload from '@/components/image-upload'
import type { Restaurant } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Sparkles, Globe, MapPin, Phone, Instagram, Palette, Star } from 'lucide-react'

const restaurantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  business_type: z.string().default('Restaurant'),
  owner_email: z.string().optional().or(z.literal('')),
  google_review_url: z.string().optional().or(z.literal('')),
  google_maps_url: z.string().optional().or(z.literal('')),
  instagram_url: z.string().optional().or(z.literal('')),
  website_url: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  primary_color: z.string().optional(),
  loyalty_offer: z.string().optional().or(z.literal('')),
  reward_stamps: z.coerce.number().min(1).max(100).default(5),
  plan_tier: z.string().default('Pro'),
  menu_url: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof restaurantSchema>

export default function RestaurantForm({ restaurant, isAdmin, isClientManage }: { restaurant?: Restaurant, isAdmin?: boolean, isClientManage?: boolean }) {
  const router = useRouter()
  const [logoUrl, setLogoUrl] = useState(restaurant?.logo_url || '')
  const [coverImageUrl, setCoverImageUrl] = useState(restaurant?.cover_image || '')
  const [menuUrl, setMenuUrl] = useState(restaurant?.menu_url || '')
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant?.name || '',
      slug: restaurant?.slug || '',
      business_type: restaurant?.business_type || 'Restaurant',
      owner_email: restaurant?.owner_email || '',
      google_review_url: restaurant?.google_review_url || '',
      google_maps_url: restaurant?.google_maps_url || '',
      instagram_url: restaurant?.instagram_url || '',
      website_url: restaurant?.website_url || '',
      phone: restaurant?.phone || '',
      whatsapp: restaurant?.whatsapp || '',
      address: restaurant?.address || '',
      primary_color: restaurant?.primary_color || '#111111',
      loyalty_offer: restaurant?.loyalty_offer || '',
      reward_stamps: restaurant?.reward_stamps || 5,
      plan_tier: restaurant?.plan_tier || 'Pro',
      menu_url: restaurant?.menu_url || '',
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
      if (value !== undefined && value !== null && value !== '') formData.append(key, value.toString())
    })
    if (logoUrl) formData.append('logo_url', logoUrl)
    if (coverImageUrl) formData.append('cover_image', coverImageUrl)
    if (menuUrl) formData.append('menu_url', menuUrl)

    try {
      if (isClientManage && restaurant?.slug) {
        const result = await updateRestaurantBySlug(restaurant.slug, formData)
        if (result?.error) {
          alert(result.error)
          return
        }
        alert('Changes saved successfully!')
        router.refresh()
      } else if (restaurant) {
        const result = await updateRestaurant(restaurant.id, formData)
        if (result?.error) {
          alert(result.error)
          return
        }
        router.refresh()
      } else {
        const result = await createRestaurant(formData)
        if (result?.error) {
          alert(result.error)
          return
        }
        router.push('/zairo-super-admin-786')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while saving.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClasses = "bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-700/60 focus-visible:ring-indigo-500/30 backdrop-blur-sm rounded-xl h-11 transition-all hover:bg-white/80 dark:hover:bg-slate-900/80"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* Basic Info Section */}
        <div className="md:col-span-2 pb-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-600 dark:text-slate-400">Business Name *</Label>
              <Input 
                id="name" 
                {...register('name')} 
                onBlur={(e) => {
                  register('name').onBlur(e)
                  generateSlug()
                }} 
                className={inputClasses} 
                placeholder="e.g. The Rustic Kitchen" 
              />
              {errors.name && <p className="text-rose-500 text-xs font-medium">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type" className="text-sm font-medium text-slate-600 dark:text-slate-400">Business Type *</Label>
              <select id="business_type" {...register('business_type')} className={`w-full ${inputClasses}`}>
                <option value="Restaurant">Restaurant</option>
                <option value="Cafe">Cafe</option>
                <option value="Hotel & Restaurant">Hotel & Restaurant</option>
                <option value="Hotel">Hotel</option>
                <option value="Gym">Gym / Fitness</option>
                <option value="Salon">Salon</option>
                <option value="Clothing & Retail">Clothing & Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="plan_tier" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Plan Tier (Admin Only) *</Label>
                <select id="plan_tier" {...register('plan_tier')} className={`w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 ${inputClasses}`}>
                  <option value="Pro">Pro (₹399 - Stamps & Reviews)</option>
                  <option value="Basic">Basic (₹199 - Reviews Only)</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium text-slate-600 dark:text-slate-400">Profile Slug (URL) *</Label>
              <div className="flex gap-2">
                <Input id="slug" {...register('slug')} className={inputClasses} placeholder="the-rustic-kitchen" />
                <Button type="button" variant="outline" onClick={generateSlug} className="h-11 px-5 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all">Generate</Button>
              </div>
              {errors.slug && <p className="text-rose-500 text-xs font-medium">{errors.slug.message}</p>}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-500" /> Contact & Location
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone Number</Label>
            <Input id="phone" {...register('phone')} className={inputClasses} placeholder="+1 (555) 000-0000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-medium text-slate-600 dark:text-slate-400">WhatsApp Number</Label>
            <Input id="whatsapp" {...register('whatsapp')} className={inputClasses} placeholder="+1 (555) 000-0000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Address</Label>
            <Input id="address" {...register('address')} className={inputClasses} placeholder="123 Main St, City, Country" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_maps_url" className="text-sm font-medium text-slate-600 dark:text-slate-400">Google Maps URL</Label>
            <Input id="google_maps_url" {...register('google_maps_url')} className={inputClasses} placeholder="https://maps.google.com/..." />
          </div>
        </div>

        {/* Links & Branding */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" /> Web Links & Branding
          </h3>

          <div className="space-y-2">
            <Label htmlFor="website_url" className="text-sm font-medium text-slate-600 dark:text-slate-400">Website URL</Label>
            <Input id="website_url" {...register('website_url')} className={inputClasses} placeholder="https://yourwebsite.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url" className="text-sm font-medium text-slate-600 dark:text-slate-400">Instagram URL</Label>
            <Input id="instagram_url" {...register('instagram_url')} className={inputClasses} placeholder="https://instagram.com/..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_review_url" className="text-sm font-medium text-slate-600 dark:text-slate-400">Google Review URL</Label>
            <Input id="google_review_url" {...register('google_review_url')} className={inputClasses} placeholder="https://g.page/review/..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_color" className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              Primary Brand Color <Palette className="w-3 h-3" />
            </Label>
            <div className="flex gap-3 items-center">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                <Input id="primary_color" type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" {...register('primary_color')} />
              </div>
              <Input type="text" {...register('primary_color')} className={`${inputClasses} font-mono text-sm uppercase flex-1`} />
            </div>
          </div>
        </div>

        {/* Marketing & Rewards */}
        <div className="space-y-6 md:col-span-2 lg:col-span-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Marketing & Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div className="space-y-2">
              <Label htmlFor="loyalty_offer" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Custom Loyalty / VIP Offer
              </Label>
              <p className="text-xs text-slate-500 mb-2">Leave blank to use the default message. Write your own attractive offer (e.g., "Join to get 15% off!").</p>
              <Input id="loyalty_offer" {...register('loyalty_offer')} className={inputClasses} placeholder="e.g. Get a free coffee on your 5th visit!" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward_stamps" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Reward Target (Visits/Stamps) *
              </Label>
              <p className="text-xs text-slate-500 mb-2">How many visits/scans before they get the reward? (Default is 5)</p>
              <Input id="reward_stamps" type="number" min={1} max={100} {...register('reward_stamps')} className={inputClasses} />
              {errors.reward_stamps && <p className="text-rose-500 text-xs font-medium">{errors.reward_stamps.message}</p>}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="md:col-span-2 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <Label htmlFor="owner_email" className="text-sm font-medium text-slate-600 dark:text-slate-400">Owner Email (Admin only) *</Label>
            <Input id="owner_email" type="email" {...register('owner_email')} className={inputClasses} />
            {errors.owner_email && <p className="text-rose-500 text-xs font-medium">{errors.owner_email.message}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo Image</Label>
          <div className="p-6 border-2 border-slate-200/60 dark:border-slate-700/60 border-dashed rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm transition-all hover:bg-white/50 dark:hover:bg-slate-900/50 hover:border-indigo-500/30">
            <ImageUpload 
              currentUrl={logoUrl} 
              onUpload={setLogoUrl} 
              restaurantId={restaurant?.id} 
              isClientManage={isClientManage}
              slug={restaurant?.slug}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cover Image</Label>
          <div className="p-6 border-2 border-slate-200/60 dark:border-slate-700/60 border-dashed rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm transition-all hover:bg-white/50 dark:hover:bg-slate-900/50 hover:border-indigo-500/30">
            <ImageUpload 
              currentUrl={coverImageUrl} 
              onUpload={setCoverImageUrl} 
              restaurantId={restaurant?.id}
              isClientManage={isClientManage}
              slug={restaurant?.slug}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
            Digital Menu (PDF/Image)
          </Label>
          <div className="p-6 border-2 border-slate-200/60 dark:border-slate-700/60 border-dashed rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm transition-all hover:bg-white/50 dark:hover:bg-slate-900/50 hover:border-indigo-500/30">
            <ImageUpload 
              currentUrl={menuUrl} 
              onUpload={setMenuUrl} 
              restaurantId={restaurant?.id}
              isClientManage={isClientManage}
              slug={restaurant?.slug}
              acceptPdf={true}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 pb-2">
        <Button type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 dark:shadow-white/20 h-12 px-8 rounded-xl font-medium transition-all w-full md:w-auto text-base" disabled={isLoading}>
          {isLoading ? 'Saving Changes...' : (restaurant ? 'Save Changes' : 'Create Business')}
        </Button>
      </div>
    </form>
  )
}
