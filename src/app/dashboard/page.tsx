import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Restaurant, FoodPhoto } from '@/lib/types'
import RestaurantForm from '@/components/restaurant-form'
import QRCodeGenerator from '@/components/qr-code-generator'
import FoodPhotosManager from '@/components/food-photos-manager'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ExternalLink, Link as LinkIcon, Camera, MapPin, QrCode, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch owner's restaurants with food photos
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*, food_photos(*)')
    .eq('owner_email', user.email!)
    .order('created_at', { ascending: false })

  if (!restaurants || restaurants.length === 0) {
    redirect('/login?error=no-restaurant')
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Welcome back, {user.email?.split('@')[0]} <Sparkles className="w-8 h-8 text-indigo-500" />
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Manage your digital presence, gallery, and QR codes below.
        </p>
      </div>

      {restaurants.map((restaurant: Restaurant & { food_photos: FoodPhoto[] }) => (
        <div key={restaurant.id} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Top row: Link & QR Code */}
          <Card className="xl:col-span-8 border-white/20 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-xl">Public Profile</CardTitle>
              </div>
              <CardDescription className="text-slate-500">Share this link with your customers to show your menu.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                <code className="flex-1 text-base text-slate-700 dark:text-slate-300 truncate font-mono">
                  {siteUrl}/r/{restaurant.slug}
                </code>
                <Link
                  href={`/r/${restaurant.slug}`}
                  target="_blank"
                  className="shrink-0 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl px-6 py-3 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Visit <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-4 border-white/20 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-xl">QR Code</CardTitle>
              </div>
              <CardDescription className="text-slate-500">Download for tables</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-0 pb-6 relative z-10">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <QRCodeGenerator slug={restaurant.slug} restaurantName={restaurant.name} />
              </div>
            </CardContent>
          </Card>

          {/* Details Form */}
          <Card className="xl:col-span-12 border-white/20 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10 pb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Business Details</CardTitle>
              </div>
              <CardDescription className="text-slate-500">Update your business information, logo, and cover</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <RestaurantForm restaurant={restaurant} />
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="xl:col-span-12 border-white/20 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10 pb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <CardTitle className="text-xl">Gallery & Menu</CardTitle>
              </div>
              <CardDescription className="text-slate-500">Showcase your business and offerings to customers</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <FoodPhotosManager
                restaurantId={restaurant.id}
                initialPhotos={restaurant.food_photos || []}
              />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
