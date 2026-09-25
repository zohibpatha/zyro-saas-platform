import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '/checkout?plan=199',
    priceMonthly: '₹199',
    setupFee: '₹499',
    setupStrikethrough: null,
    setupDiscount: null,
    description: 'Perfect for individuals getting started with their digital presence.',
    features: ['Basic QR Page', 'Standard QR Code', 'Single location', 'Community support'],
    mostPopular: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/checkout?plan=399',
    priceMonthly: '₹399',
    setupFee: '₹999',
    setupStrikethrough: '₹1999',
    setupDiscount: '50% Off',
    description: 'Smart Review Funnel, Private Feedback & full customization.',
    features: ['Smart Review Funnel', 'Private Feedback Dashboard', 'Custom Brand Colors', 'Analytics Dashboard', 'Priority WhatsApp Support'],
    mostPopular: true,
  },
  {
    name: 'Elite',
    id: 'tier-elite',
    href: '/checkout?plan=699',
    priceMonthly: '₹699',
    setupFee: '₹1499',
    setupStrikethrough: null,
    setupDiscount: null,
    description: 'Advanced features for established businesses and franchises.',
    features: ['Everything in Pro', 'Unlimited locations', 'Custom Branding', 'Dedicated Account Manager', '24/7 Phone Support'],
    mostPopular: false,
  },
]

const faqs = [
  {
    question: 'What is the setup fee for?',
    answer: 'The one-time setup fee covers the initial configuration, design, and personalized branding of your digital page by our team.'
  },
  {
    question: 'Can I switch plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes to your monthly subscription will be pro-rated.'
  },
  {
    question: 'Are there any hidden fees?',
    answer: 'No! The prices you see are all you pay. There are no hidden transaction fees or extra costs.'
  },
  {
    question: 'How does the Smart Review Funnel work?',
    answer: 'The Smart Review Funnel directs happy customers to Google to leave a 5-star review, while capturing negative feedback privately so you can resolve it before it goes public.'
  }
]

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { ref } = await searchParams
  const refQuery = ref ? (typeof ref === 'string' ? ref : ref[0]) : null

  let isAdmin = false
  if (user) {
    const { data: admin } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', user.email!)
      .maybeSingle()
    if (admin) isAdmin = true
  }

  // Update hrefs dynamically with referral code
  const tiersWithRef = tiers.map(tier => {
    let href = tier.href
    if (refQuery) {
      href += href.includes('?') ? `&ref=${refQuery}` : `?ref=${refQuery}`
    }
    return { ...tier, href }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-indigo-500/30">
      <Navbar user={user ? { email: user.email! } : null} isAdmin={isAdmin} />
      
      <main className="flex-1 flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white mb-6">
            Pricing that scales with you
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400">
            Everything you need to build your business's digital presence. Simple, transparent, and built for growth.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full items-center mb-24">
          {tiersWithRef.map((tier) => (
            <div 
              key={tier.id}
              className={`relative bg-white dark:bg-slate-900 border rounded-3xl p-8 shadow-sm flex flex-col h-full transition-transform ${
                tier.mostPopular 
                  ? 'border-indigo-500 ring-2 ring-indigo-500 md:scale-105 shadow-xl md:-mt-8 z-10 dark:shadow-indigo-500/10' 
                  : 'border-slate-200 dark:border-slate-800 hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {tier.mostPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tier.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 h-10">{tier.description}</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline text-4xl font-extrabold text-slate-900 dark:text-white">
                  {tier.setupFee}
                  <span className="ml-2 text-lg font-medium text-slate-500 dark:text-slate-400 line-through">
                    {tier.setupStrikethrough || `₹${parseInt(tier.setupFee.replace('₹', '')) + parseInt(tier.priceMonthly.replace('₹', ''))}`}
                  </span>
                </div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400 mt-2 bg-green-100 dark:bg-green-900/30 inline-block px-2 py-1 rounded">
                  🎉 Pay ONLY setup fee today!
                </div>
              </div>

              <div className={`p-4 rounded-2xl mb-8 border ${tier.mostPopular ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Monthly Maintenance: {tier.priceMonthly}/mo</span>
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                  (1st Month is 100% FREE!)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Maintenance billing starts after 28 days.
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 ${tier.mostPopular ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                asChild
                size="lg" 
                className={`w-full mt-auto h-12 text-base font-semibold transition-all ${
                  tier.mostPopular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg hover:-translate-y-1'
                    : 'bg-white text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 shadow-sm'
                }`}
              >
                <Link href={tier.href}>
                  Get Started Now
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* FAQs Section */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <dl className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <dt className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {faq.question}
                </dt>
                <dd className="text-base text-slate-600 dark:text-slate-400">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>

      </main>
    </div>
  )
}
