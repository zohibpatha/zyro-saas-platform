'use client'

import { useState } from 'react'
import type { RestaurantWithPhotos } from '@/lib/types'
import { Star, MapPin, Instagram, Phone, MessageCircle, Globe, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'
import { submitPrivateFeedback } from '@/actions/feedback'

export function PublicPageContent({ restaurant }: { restaurant: RestaurantWithPhotos }) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const photos = [...(restaurant.food_photos || [])].sort((a, b) => a.sort_order - b.sort_order)

  const formatUrl = (url: string | null) => {
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
  }

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || isSubmitting) return
    setIsSubmitting(true)
    const res = await submitPrivateFeedback(restaurant.id, rating, feedback)
    setIsSubmitting(false)
    if (res.success) {
      setIsSubmitted(true)
    }
  }

  const getSuccessMessage = () => {
    const type = (restaurant.business_type || '').toLowerCase()
    if (type.includes('gym') || type.includes('fitness')) return "Glad you enjoyed your workout! Please share your experience."
    if (type.includes('cafe') || type.includes('coffee')) return "Glad you loved the coffee! Please share your experience."
    if (type.includes('restaurant') || type.includes('food')) return "Glad you loved the food! Please share your experience."
    if (type.includes('salon') || type.includes('spa')) return "Glad you loved your visit! Please share your experience."
    return "Glad you had a great experience! Please share it with others."
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

      {/* Smart Review Funnel */}
      <div className="w-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-[2rem] p-6 flex flex-col items-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-orange-500/5 to-pink-500/10 pointer-events-none" />
        
        <h3 className="font-extrabold text-xl text-slate-800 mb-2 z-10 text-center">How was your experience?</h3>
        <p className="text-sm font-medium text-slate-500 mb-6 z-10 text-center">Tap a star to rate us</p>

        <div className="flex items-center gap-3 mb-6 z-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => {
                setRating(star)
                setIsSubmitted(false)
                setFeedback('')
              }}
              className="transition-transform duration-200 hover:scale-125 active:scale-95 focus:outline-none"
            >
              <Star
                className={`h-10 w-10 transition-colors duration-300 ${
                  (hoveredRating || rating) >= star
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                    : 'text-slate-300 fill-slate-100'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Dynamic States based on Rating */}
        {rating > 0 && rating <= 3 && (
          <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 z-10">
            {!isSubmitted ? (
              <>
                <p className="text-sm font-semibold text-slate-700 text-center">
                  We're sorry to hear that. How can we improve our {restaurant.business_type?.toLowerCase() || 'business'}?
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what went wrong..."
                  className="w-full bg-white/80 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none h-28 shadow-inner"
                />
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={isSubmitting || !feedback.trim()}
                  className="w-full bg-slate-900 text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Feedback'}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-emerald-600">
                <CheckCircle2 className="h-12 w-12" />
                <p className="font-bold text-center">Thank you for your feedback!</p>
                <p className="text-sm text-center opacity-80">We'll use this to improve our service.</p>
              </div>
            )}
          </div>
        )}

        {rating >= 4 && restaurant.google_review_url && (
          <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 z-10">
            <p className="text-sm font-bold text-slate-800 text-center px-4">
              {getSuccessMessage()}
            </p>
            <a
              href={formatUrl(restaurant.google_review_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full rounded-2xl p-[2px] overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 animate-pulse blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 opacity-100" />
              <div className="relative h-14 w-full bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Globe className="h-5 w-5 text-white" />
                <span className="text-white font-black tracking-wide">Post on Google</span>
                <ChevronRight className="text-white h-5 w-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </a>
          </div>
        )}
      </div>

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
