import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: admin } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', user.email!)
      .maybeSingle()
    if (admin) isAdmin = true
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar user={user ? { email: user.email! } : null} isAdmin={isAdmin} />
      <main className="flex-1 flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-gray-900 dark:text-white mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to build your business's digital presence. No hidden fees.
          </p>
        </div>

        <div className="relative max-w-lg mx-auto w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-20 dark:opacity-40 animate-pulse"></div>
          
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pro Business</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Most Popular
              </span>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline text-5xl font-extrabold text-gray-900 dark:text-white">
                ₹399
                <span className="ml-2 text-xl font-medium text-gray-500 dark:text-gray-400">/mo</span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 mb-8">
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-1">
                Limited Time Offer
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">₹999</span>
                <span className="text-gray-500 dark:text-gray-400 line-through text-sm">₹1999</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">One-time setup fee</span>
              </div>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1">
                50% Off setup fee! We build and configure your digital page.
              </p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Custom Digital Business Card',
                'QR Code Generation',
                'Menu & Link Management',
                'Google Review Integration',
                'Analytics Dashboard',
                'Priority Email Support'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/login" className="w-full">
              <Button size="lg" className="w-full h-12 text-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-xl shadow-gray-900/10 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
