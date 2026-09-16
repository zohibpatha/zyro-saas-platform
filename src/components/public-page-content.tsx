'use client'

import type { RestaurantWithPhotos } from '@/lib/types'
import { Star, MapPin, Instagram, Phone, MessageCircle, Globe } from 'lucide-react'

export function PublicPageContent({ restaurant }: { restaurant: RestaurantWithPhotos }) {
  // Sort photos by sort_order
  const photos = [...(restaurant.food_photos || [])].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-4">
      {/* Google Review - Primary CTA */}
      {restaurant.google_review_url && (
        <a 
          href={restaurant.google_review_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full h-16 rounded-xl bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Star className="h-6 w-6 fill-current" />
          Leave a Review
        </a>
      )}

      {/* Google Maps */}
      {restaurant.google_maps_url && (
        <a 
          href={restaurant.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm"
        >
          <MapPin className="h-5 w-5" />
          Get Directions
        </a>
      )}

      {/* Instagram */}
      {restaurant.instagram_url && (
        <a 
          href={restaurant.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full h-14 rounded-xl text-white font-semibold text-base shadow-sm transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
          }}
        >
          <Instagram className="h-5 w-5" />
          Follow on Instagram
        </a>
      )}

      {/* Action Row: Call & WhatsApp */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {restaurant.phone && (
          <a 
            href={`tel:${restaurant.phone}`}
            className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-green-600 text-white font-semibold text-base hover:bg-green-700 transition-colors shadow-sm"
          >
            <Phone className="h-5 w-5" />
            Call Us
          </a>
        )}
        
        {restaurant.whatsapp && (
          <a 
            href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-[#25D366] text-white font-semibold text-base hover:bg-[#1ebd5a] transition-colors shadow-sm"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </a>
        )}
      </div>

      {/* Website */}
      {restaurant.website_url && (
        <a 
          href={restaurant.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full h-14 rounded-xl border-2 border-gray-200 bg-white text-gray-800 font-semibold text-base hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Globe className="h-5 w-5" />
          Visit Website
        </a>
      )}

      {/* Food Photos Gallery */}
      {photos.length > 0 && (
        <div className="pt-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900 px-1">Gallery</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="flex-none w-48 h-48 rounded-xl overflow-hidden snap-center relative shadow-sm"
              >
                <img 
                  src={photo.image_url} 
                  alt="Food photo" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
