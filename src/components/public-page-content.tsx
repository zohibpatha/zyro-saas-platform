'use client'

import type { RestaurantWithPhotos } from '@/lib/types'
import { Star, MapPin, Instagram, Phone, MessageCircle, Globe, ChevronRight } from 'lucide-react'

export function PublicPageContent({ restaurant }: { restaurant: RestaurantWithPhotos }) {
  const photos = [...(restaurant.food_photos || [])].sort((a, b) => a.sort_order - b.sort_order)

  const formatUrl = (url: string | null) => {
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Business Type Badge */}
      {restaurant.business_type && (
        <div className="flex justify-center mb-2">
          <span className="px-4 py-1.5 rounded-full bg-slate-900/5 border border-slate-900/10 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md">
            {restaurant.business_type}
          </span>
        </div>
      )}

      {/* Massive Glowing Google Review CTA */}
      {restaurant.google_review_url && (
        <a 
          href={formatUrl(restaurant.google_review_url)}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-full rounded-[2rem] p-1 overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 animate-pulse blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 opacity-90" />
          <div className="relative h-20 w-full bg-white/10 backdrop-blur-md rounded-[1.8rem] flex items-center justify-between px-6 border border-white/20 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-inner">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl tracking-wide drop-shadow-md">Leave a Review</span>
                <span className="text-white/90 text-xs font-medium uppercase tracking-wider">Help us grow on Google</span>
              </div>
            </div>
            <ChevronRight className="text-white h-6 w-6 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </a>
      )}

      {/* Bento Grid layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Instagram */}
        {restaurant.instagram_url && (
          <a 
            href={formatUrl(restaurant.instagram_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 group flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
              <Instagram className="h-7 w-7 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Instagram</span>
          </a>
        )}

        {/* Google Maps */}
        {restaurant.google_maps_url && (
          <a 
            href={formatUrl(restaurant.google_maps_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 group flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Directions</span>
          </a>
        )}

        {/* WhatsApp */}
        {restaurant.whatsapp && (
          <a 
            href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 group flex items-center p-4 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-md shadow-[#25D366]/30 mr-4">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 flex flex-col">
              <span className="font-bold text-slate-800 text-base">WhatsApp Us</span>
              <span className="text-xs font-medium text-slate-500">Fast replies</span>
            </div>
            <ChevronRight className="text-slate-400 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        )}

        {/* Phone & Web */}
        {restaurant.phone && (
          <a 
            href={`tel:${restaurant.phone}`}
            className="col-span-1 group flex items-center gap-3 p-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Phone className="h-5 w-5 text-slate-700" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Call</span>
          </a>
        )}

        {restaurant.website_url && (
          <a 
            href={formatUrl(restaurant.website_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 group flex items-center gap-3 p-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-slate-700" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Website</span>
          </a>
        )}
      </div>

      {/* Modern Gallery */}
      {photos.length > 0 && (
        <div className="mt-6 w-full">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-extrabold text-slate-900">Gallery</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-4"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="flex-none w-56 h-64 rounded-[2rem] overflow-hidden snap-center relative shadow-2xl shadow-slate-900/10 hover:-translate-y-2 transition-transform duration-500"
              >
                <img 
                  src={photo.image_url} 
                  alt="Gallery photo" 
                  className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
