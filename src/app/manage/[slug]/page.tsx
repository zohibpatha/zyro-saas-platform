import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Restaurant, FoodPhoto, PrivateFeedback } from '@/lib/types'
import RestaurantForm from '@/components/restaurant-form'
import QRCodeGenerator from '@/components/qr-code-generator'
import FoodPhotosManager from '@/components/food-photos-manager'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ExternalLink, Link as LinkIcon, Camera, MapPin, QrCode, Sparkles, MessageSquareWarning, Users, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ClientManagePage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  
  const { slug } = await params

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*, food_photos(*), private_feedback(*), loyalty_customers(*)')
    .eq('slug', slug)
    .maybeSingle()

  if (!restaurant) {
    notFound()
  }

  const isExpired = restaurant.subscription_end_date && new Date(restaurant.subscription_end_date) < new Date()

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-rose-200 dark:border-rose-900">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Subscription Expired</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Your access to the Zyro platform has expired. Please renew your subscription to restore your public page and dashboard. All your data is safely backed up.</p>
          <a href={`/checkout?plan=${restaurant.plan_tier === 'Basic' ? '199' : '399'}&restaurant_id=${restaurant.id}`} className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
            Renew Subscription
          </a>
        </div>
      </div>
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Manage {restaurant.name} <Sparkles className="w-8 h-8 text-indigo-500" />
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Update your business details, menu, and gallery below. Bookmark this private link.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
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
            <RestaurantForm restaurant={restaurant} isClientManage={true} />
          </CardContent>
        </Card>

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
              isClientManage={true}
              slug={restaurant.slug}
            />
          </CardContent>
        </Card>

        <Card className="xl:col-span-12 border-white/20 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative z-10 pb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <MessageSquareWarning className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl">Private Feedback</CardTitle>
            </div>
            <CardDescription className="text-slate-500">Constructive feedback from customers (1-3 stars)</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            {!restaurant.private_feedback || restaurant.private_feedback.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No private feedback received yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...restaurant.private_feedback]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((feedback) => (
                  <div key={feedback.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < feedback.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {feedback.message && (
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 italic">"{feedback.message}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {restaurant.plan_tier !== 'Basic' && (
          <Card className="xl:col-span-12 border-white/20 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10 pb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-xl">Customer CRM</CardTitle>
              </div>
              <CardDescription className="text-slate-500">Track returning customers and their loyalty stamps</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {!restaurant.loyalty_customers || restaurant.loyalty_customers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No customers have claimed a stamp yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">WhatsApp Number</th>
                        <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Total Visits</th>
                        <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Last Visit</th>
                        <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...restaurant.loyalty_customers]
                        .sort((a, b) => b.visits - a.visits)
                        .map((customer) => {
                          const daysSinceVisit = Math.floor((new Date().getTime() - new Date(customer.last_visit).getTime()) / (1000 * 3600 * 24));
                          const isDormant = daysSinceVisit > 7;
                          const targetStamps = restaurant.reward_stamps || 5;
                          const stampsLeft = targetStamps - (customer.visits % targetStamps);
                          
                          const reminderText = encodeURIComponent(`Hey! We miss you at ${restaurant.name}. You have ${customer.visits} visits so far. Just ${stampsLeft} more to go to unlock your reward! Come visit us soon. 🚀`);
                          const waLink = `https://wa.me/${customer.phone}?text=${reminderText}`;

                          return (
                            <tr key={customer.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                                +{customer.phone}
                                {isDormant && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                    Missing ({daysSinceVisit}d)
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2.5 py-0.5 rounded-full text-sm font-medium">
                                  {customer.visits} stamps
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-500">
                                {new Date(customer.last_visit).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <a 
                                  href={waLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" /> Remind
                                </a>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}