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
    .single()

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
    .single()

  if (error || !restaurant || !restaurant.is_active) {
    notFound()
  }

  const restaurantData = restaurant as RestaurantWithPhotos

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl relative bg-white">
      {/* Cover Image */}
      <div 
        className="h-48 w-full bg-gray-200 relative"
        style={{
          backgroundImage: restaurantData.cover_image ? `url(${restaurantData.cover_image})` : 'none',
          backgroundColor: restaurantData.primary_color || '#e5e7eb',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Profile Section */}
      <div className="px-6 relative flex flex-col items-center -mt-16 pb-6">
        <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
          {restaurantData.logo_url ? (
            <img src={restaurantData.logo_url} alt={`${restaurantData.name} logo`} className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-gray-300">{restaurantData.name.charAt(0)}</span>
          )}
        </div>
        
        <h1 className="mt-4 text-2xl font-bold text-center text-gray-900">{restaurantData.name}</h1>
        {restaurantData.address && (
          <p className="mt-1 text-sm text-gray-500 text-center max-w-xs">{restaurantData.address}</p>
        )}
      </div>

      <div className="px-4 pb-8 flex-1">
        <PublicPageContent restaurant={restaurantData} />
      </div>
    </div>
  )
}
