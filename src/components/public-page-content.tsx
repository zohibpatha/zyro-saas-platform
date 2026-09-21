'use client'

import { useState } from 'react'
import type { RestaurantWithPhotos } from '@/lib/types'
import { Star, MapPin, Instagram, Phone, MessageCircle, Globe, ChevronRight, Loader2, CheckCircle2, Gift, Activity, Crown } from 'lucide-react'
import { submitPrivateFeedback } from '@/actions/feedback'
import { claimLoyaltyStamp } from '@/actions/loyalty'
import { LuckySpin, VipClubForm } from './retail-features'

export function PublicPageContent({ restaurant }: { restaurant: RestaurantWithPhotos }) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const [loyaltyPhone, setLoyaltyPhone] = useState('')
  const [isClaiming, setIsClaiming] = useState(false)
  const [loyaltyVisits, setLoyaltyVisits] = useState<number | null>(null)

  const photos = [...(restaurant.food_photos || [])].sort((a, b) => a.sort_order - b.sort_order)

  const formatUrl = (url: string | null) => {
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
  }

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await submitPrivateFeedback(restaurant.id, rating, feedback)
      if (res.success) {
        setIsSubmitted(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
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

  const handleClaimLoyalty = async () => {
    if (!loyaltyPhone || loyaltyPhone.length < 10) {
      alert("Please enter a valid 10-digit WhatsApp number.")
      return
    }
    setIsClaiming(true)
    try {
      const result = await claimLoyaltyStamp(restaurant.id, loyaltyPhone)
      if (result.success) {
        setLoyaltyVisits(result.visits || 1)
      } else {
        alert(result.error)
      }
    } catch (e) {
      console.error(e)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsClaiming(false)
    }
  }

  const isGym = (restaurant.business_type || '').toLowerCase().includes('gym') || (restaurant.business_type || '').toLowerCase().includes('fitness')
  const isHotelAndRestaurant = restaurant.business_type === 'Hotel & Restaurant'
  const isHotel = ((restaurant.business_type || '').toLowerCase().includes('hotel') || (restaurant.business_type || '').toLowerCase().includes('resort') || (restaurant.business_type || '').toLowerCase().includes('homestay')) && !isHotelAndRestaurant
  const isRetail = (restaurant.business_type || '').toLowerCase().includes('retail') || (restaurant.business_type || '').toLowerCase().includes('clothing')
  const targetStamps = restaurant.reward_stamps || 5

  const handleVipSubmit = async (details: {name: string, phone: string, dob: string, anniversary: string}) => {
    setIsClaiming(true)
    try {
      const result = await claimLoyaltyStamp(restaurant.id, details.phone, details)
      if (result.success) {
        alert("Welcome to the VIP Club! Your details have been saved.")
      } else {
        alert(result.error)
      }
    } catch (e) {
      console.error(e)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsClaiming(false)
    }
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

      {isRetail ? (
        <div className="flex flex-col gap-6">
          <LuckySpin onWin={(prize) => console.log('Won:', prize)} />
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-[2rem] p-6 relative overflow-hidden">
            <h3 className="font-extrabold text-xl text-slate-800 mb-4 text-center">Join our VIP Club</h3>
            <VipClubForm onSubmit={handleVipSubmit} isLoading={isClaiming} />
          </div>
        </div>
      ) : (
        <>
          {/* Loyalty Stamp Card */}
          {restaurant.plan_tier !== 'Basic' && (
            <div className={`w-full ${isGym ? 'bg-gradient-to-br from-orange-500 to-red-600' : (isHotel || isHotelAndRestaurant) ? 'bg-gradient-to-br from-emerald-600 to-teal-800' : 'bg-gradient-to-br from-indigo-500 to-purple-600'} rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden flex flex-col items-center`}>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
              
              {isGym ? <Activity className="w-10 h-10 text-white mb-2" /> : (isHotel || isHotelAndRestaurant) ? <Crown className="w-10 h-10 text-amber-300 mb-2" /> : <Gift className="w-10 h-10 text-white mb-2" />}
              <h3 className="font-extrabold text-xl mb-1 text-center">
                {isGym ? 'Workout Tracker' : isHotel ? 'VIP Guest Club' : isHotelAndRestaurant ? 'Guest & Diner VIP' : 'Loyalty Rewards'}
              </h3>
              
              {loyaltyVisits === null ? (
                <>
                  <p className="text-sm text-white/80 mb-6 text-center">
                    {restaurant.loyalty_offer || (isGym ? 'Enter your WhatsApp number to log your attendance!' : isHotel ? 'Join for direct-booking discounts & room upgrades!' : 'Enter your WhatsApp number to collect a visit stamp!')}
                  </p>
                  <div className="flex w-full max-w-sm gap-2">
                    <input
                      type="tel"
                      placeholder="WhatsApp Number"
                      value={loyaltyPhone}
                      onChange={(e) => setLoyaltyPhone(e.target.value)}
                      className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all font-medium"
                    />
                    <button
                      onClick={handleClaimLoyalty}
                      disabled={isClaiming}
                      className={`bg-white ${isGym ? 'text-red-600' : (isHotel || isHotelAndRestaurant) ? 'text-emerald-700' : 'text-indigo-600'} px-5 rounded-xl font-bold hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center min-w-[80px]`}
                    >
                      {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : (isGym ? 'Log In' : isHotel ? 'Join' : isHotelAndRestaurant ? 'Join & Claim' : 'Claim')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-500">
                  {isHotel ? (
                    <div className="bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col items-center mb-4 w-full text-center">
                      <Crown className="w-12 h-12 text-amber-400 mb-3" />
                      <p className="font-bold text-lg text-amber-300">Welcome, VIP!</p>
                      <p className="text-sm text-white/90 mt-1">Show this screen for a surprise gift. You will receive 15% off on your next direct booking!</p>
                    </div>
                  ) : (
                    <div className="bg-white/20 rounded-2xl p-4 flex gap-2 mb-4 flex-wrap justify-center max-w-[300px]">
                      {[...Array(targetStamps)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${
                            i < (loyaltyVisits % targetStamps === 0 && loyaltyVisits > 0 ? targetStamps : loyaltyVisits % targetStamps) 
                              ? 'bg-amber-400 text-amber-900 shadow-amber-500/50' 
                              : 'bg-white/10 text-white/20'
                          }`}
                        >
                          {isGym ? (i < (loyaltyVisits % targetStamps === 0 && loyaltyVisits > 0 ? targetStamps : loyaltyVisits % targetStamps) ? '🔥' : '○') : (i < (loyaltyVisits % targetStamps === 0 && loyaltyVisits > 0 ? targetStamps : loyaltyVisits % targetStamps) ? '★' : '○')}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!isHotel && (
                    <p className="text-center font-bold text-lg">
                      {loyaltyVisits > 0 && loyaltyVisits % targetStamps === 0 
                        ? (isGym ? `🔥 ${targetStamps}-Day Streak Hit!` : "🎉 You've unlocked a reward!")
                        : (isGym ? `${loyaltyVisits % targetStamps} Day Streak! Keep going 💪` : `${targetStamps - (loyaltyVisits % targetStamps)} visits left for a reward!`)}
                    </p>
                  )}
                  <p className="text-xs text-white/70 mt-1">Total {isGym ? 'workouts' : isHotel ? 'stays' : 'visits'}: {loyaltyVisits}</p>
                </div>
              )}
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
            
            <div className="relative">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your review here..."
                className="w-full bg-white/80 border border-slate-200 rounded-2xl p-4 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none h-24 shadow-inner"
              />
              {!feedback && (
                <button 
                  onClick={() => {
                    const type = (restaurant.business_type || 'business').toLowerCase()
                    const templates = [
                      `Amazing experience at ${restaurant.name}! The service was top-notch and I highly recommend this ${type}.`,
                      `Had a fantastic time here. Great ${type}, excellent staff, and wonderful atmosphere. 5 stars!`,
                      `Absolutely loved my visit to ${restaurant.name}. Everything was perfect and the quality is outstanding.`
                    ]
                    setFeedback(templates[Math.floor(Math.random() * templates.length)])
                  }}
                  className="absolute bottom-3 right-3 text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold hover:bg-amber-200 transition-colors"
                >
                  Auto-fill
                </button>
              )}
            </div>

            <button
                onClick={async () => {
                  try {
                    if (feedback.trim()) await navigator.clipboard.writeText(feedback)
                  } catch (err) {
                    console.error('Clipboard write failed:', err)
                  } finally {
                    window.open(formatUrl(restaurant.google_review_url), '_blank')
                  }
                }}
              className="group relative w-full rounded-2xl p-[2px] overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 animate-pulse blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 opacity-100" />
              <div className="relative h-14 w-full bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Globe className="h-5 w-5 text-white" />
                <span className="text-white font-black tracking-wide">Copy & Post on Google</span>
                <ChevronRight className="text-white h-5 w-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
            <p className="text-[11px] text-center text-slate-400 font-medium px-4">
              Clicking this will copy your text and open Google Maps so you can simply paste and post!
            </p>
          </div>
        )}
      </div>
      </>
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
