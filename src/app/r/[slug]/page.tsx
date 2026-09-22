import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { PublicPageContent } from '@/components/public-page-content'
import type { RestaurantWithPhotos } from '@/lib/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, logo_url, is_active')
    .eq('slug', slug)
    .maybeSingle()

  if (!restaurant || !restaurant.is_active) {
    return {
      title: 'Restaurant Not Found',
    }
  }

  return {
    title: restaurant.name,
    description: `Connect with ${restaurant.name}`,
    openGraph: {
      images: restaurant.logo_url ? [restaurant.logo_url] : [],
    }
  }
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      food_photos (*)
    `)
    .eq('slug', slug)
    .maybeSingle()

  if (error || !restaurant || !restaurant.is_active) {
    notFound()
  }

  const isExpired = restaurant.subscription_end_date && new Date(restaurant.subscription_end_date) < new Date()
  const isTrialExpired = restaurant.trial_expires_at && new Date(restaurant.trial_expires_at) < new Date()

  if (isExpired || isTrialExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Page Unavailable</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">This business profile is currently inactive or undergoing maintenance. Please check back later.</p>
        </div>
      </div>
    )
  }

  const restaurantData = restaurant as RestaurantWithPhotos

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none -z-10" />
      <div 
        className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[100px] opacity-30 pointer-events-none -z-10"
        style={{ backgroundColor: restaurantData.primary_color || '#3b82f6' }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none -z-10"
        style={{ backgroundColor: '#ec4899' }}
      />

      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col relative z-10 pb-12">
        {/* Cover Image Area */}
        <div className="relative w-full h-64 rounded-b-[3rem] overflow-hidden shadow-2xl mb-16">
          <div 
            className="absolute inset-0 w-full h-full object-cover scale-105"
            style={{
              backgroundImage: restaurantData.cover_image ? `url(${restaurantData.cover_image})` : 'none',
              backgroundColor: restaurantData.primary_color || '#e5e7eb',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Logo overlapping the cover */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="h-28 w-28 rounded-full p-1 bg-white/30 backdrop-blur-xl shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center border-4 border-white">
                {restaurantData.logo_url ? (
                  <img src={restaurantData.logo_url} alt={`${restaurantData.name} logo`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-gray-300">{restaurantData.name.charAt(0)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="px-6 flex flex-col items-center mb-8">
          <h1 className="text-3xl font-extrabold text-center text-slate-900 tracking-tight">{restaurantData.name}</h1>
          {restaurantData.address && (
            <p className="mt-2 text-sm font-medium text-slate-500 text-center max-w-xs">{restaurantData.address}</p>
          )}
        </div>

        {/* Action Content */}
        <div className="px-4 w-full flex-1">
          <PublicPageContent restaurant={restaurantData} />
        </div>
      </div>
    </div>
  )
}
