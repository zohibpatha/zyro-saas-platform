import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: 'https://wa.me/917067615270?text=Hi%20Zyro!%20I%20am%20interested%20in%20the%20Starter%20Plan%20(%E2%82%B9199/mo).%20Please%20help%20me%20get%20started.',
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
    href: 'https://wa.me/917067615270?text=Hi%20Zyro!%20I%20am%20interested%20in%20the%20Pro%20Plan%20(%E2%82%B9399/mo)%20with%20the%20Smart%20Review%20Funnel.%20Please%20help%20me%20get%20started.',
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
    href: 'https://wa.me/917067615270?text=Hi%20Zyro!%20I%20am%20interested%20in%20the%20Elite%20Plan%20(%E2%82%B9699/mo).%20Please%20help%20me%20get%20started.',
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
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className={`relative bg-white dark:bg-slate-900 border rounded-3xl p-8 shadow-sm flex flex-col h-full transition-transform ${
                tier.mostPopular 
                  ? 'border-indigo-500 ring-2 ring-indigo-500 scale-105 shadow-xl md:-mt-8 z-10 dark:shadow-indigo-500/10' 
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
                  {tier.priceMonthly}
                  <span className="ml-1 text-base font-medium text-slate-500 dark:text-slate-400">/mo</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl mb-8 border ${tier.mostPopular ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                {tier.setupDiscount && (
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                    {tier.setupDiscount} Setup
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{tier.setupFee}</span>
                  {tier.setupStrikethrough && (
                    <span className="text-slate-400 dark:text-slate-500 line-through text-sm">{tier.setupStrikethrough}</span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Setup fee</span>
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

              <a href={tier.href} target="_blank" rel="noopener noreferrer" className="w-full mt-auto">
                <Button 
                  size="lg" 
                  className={`w-full h-12 text-base font-semibold transition-all ${
                    tier.mostPopular
                      ? 'bg-[#25D366] text-white hover:bg-[#128C7E] shadow-md hover:shadow-lg'
                      : 'bg-[#25D366] text-white hover:bg-[#128C7E] shadow-md hover:shadow-lg'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Get Started on WhatsApp
                </Button>
              </a>
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
