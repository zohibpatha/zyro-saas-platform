'use client'

import { useState } from 'react'
import { QrCode, ShieldCheck, CheckCircle2, Store, Globe, Instagram, MessageCircle, MapPin, Star, Link2, Copy, Check, ChevronRight } from 'lucide-react'
import { submitManualPayment } from '@/actions/checkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const BUSINESS_TYPES = ['Restaurant', 'Cafe', 'Gym', 'Hotel', 'Salon', 'Other']

export default function CheckoutClient() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1) // Step 1: Business Details, Step 2: Payment
  const [dashboardUrl, setDashboardUrl] = useState('')
  const [qrPageUrl, setQrPageUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await submitManualPayment(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setDashboardUrl(result.dashboardUrl || '')
      setQrPageUrl(result.qrPageUrl || '')
      setLoading(false)
    }
  }

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // SUCCESS STATE — Premium Linear/Stripe style
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-14 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800/60 max-w-2xl mx-auto backdrop-blur-xl">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20 transform hover:scale-105 transition-transform duration-500">
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-slate-50 mb-4">Your Business is Live</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 text-[15px] leading-relaxed">
          Your digital profile and QR code have been activated instantly. Copy your unique link below or print the QR code for your storefront.
        </p>
        
        {qrPageUrl && (
          <div className="w-full max-w-md space-y-4 mb-10">
            <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800/80 backdrop-blur-sm">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Public QR Profile</p>
              <div className="flex items-center gap-3 bg-white dark:bg-[#0a0a0a] rounded-lg p-3 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-md">
                  <Link2 className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium font-mono truncate flex-1">{qrPageUrl}</span>
                <button onClick={() => copyLink(qrPageUrl)} className="shrink-0 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />}
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-4 text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live & Active
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {qrPageUrl && (
            <a href={qrPageUrl} target="_blank" className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-lg font-medium text-[15px] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/50">
              View Public Page <ChevronRight className="w-4 h-4" />
            </a>
          )}
          {dashboardUrl && (
            <a href={dashboardUrl} className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg font-medium text-[15px] transition-all focus:outline-none focus:ring-2 focus:ring-slate-200">
              Go to Dashboard
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800/80 overflow-hidden max-w-3xl mx-auto">
      {/* Progress Steps - Stripe-like minimalistic */}
      <div className="flex border-b border-slate-100 dark:border-slate-800/80 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${step >= 1 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${step >= 1 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>1</span>
            Business Profile
          </div>
          <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
          <div className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${step >= 2 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${step >= 2 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>2</span>
            Activation
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12">
        {error && (
          <div className="bg-red-50/50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg border border-red-100 dark:border-red-500/20 mb-8 flex items-center gap-3">
            <div className="w-1 h-full bg-red-500 rounded-full" />
            {error}
          </div>
        )}

        {/* STEP 1: Business Details */}
        <div className={step === 1 ? 'block animate-in fade-in slide-in-from-bottom-2 duration-500' : 'hidden'}>
          <div className="mb-10">
            <h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-slate-50 mb-2">Create your profile</h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px]">We'll set up your digital presence automatically.</p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="business_name" className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input id="business_name" name="business_name" placeholder="e.g. Acme Corp" required className="h-11 rounded-lg border-slate-200 dark:border-slate-800 bg-transparent text-[15px] focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-shadow" />
              </div>
              
              <div className="space-y-2.5">
                <Label htmlFor="business_type" className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Business Type <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select id="business_type" name="business_type" required className="w-full h-11 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-[15px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-shadow appearance-none">
                    {BUSINESS_TYPES.map(t => <option key={t} value={t} className="bg-white dark:bg-slate-900">{t}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="google_review_url" className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                Google Review Link <span className="text-red-500">*</span>
              </Label>
              <Input id="google_review_url" name="google_review_url" placeholder="https://g.page/review/..." required className="h-11 rounded-lg border-slate-200 dark:border-slate-800 bg-transparent text-[15px] focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-shadow" />
              <p className="text-[12px] text-slate-500">Customers will be redirected here after scanning your QR code.</p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="google_maps_url" className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                Google Maps Link
              </Label>
              <Input id="google_maps_url" name="google_maps_url" placeholder="https://maps.google.com/..." className="h-11 rounded-lg border-slate-200 dark:border-slate-800 bg-transparent text-[15px] focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-shadow" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="instagram_url" className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Instagram Profile
                </Label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <Input id="instagram_url" name="instagram_url" placeholder="instagram.com/yourbusiness" className="h-11 rounded-lg border-slate-200 dark:border-slate-800 bg-transparent text-[15px] pl-10 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-shadow" />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <Label htmlFor="website_url" className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Website URL
                </Label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <Input id="website_url" name="website_url" placeholder="yourbusiness.com" className="h-11 rounded-lg border-slate-200 dark:border-slate-800 bg-transparent text-[15px] pl-10 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-shadow" />
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Label htmlFor="whatsapp" className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                WhatsApp Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <Input id="whatsapp" name="whatsapp" type="tel" placeholder="+91 98765 43210" required className="h-11 rounded-lg border-slate-200 dark:border-slate-800 bg-transparent text-[15px] pl-10 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-shadow" />
              </div>
              <p className="text-[12px] text-slate-500">We'll send your dashboard login credentials to this number.</p>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-100 dark:border-slate-800/80 pt-8 flex justify-end">
            <Button type="button" onClick={() => {
              const form = document.querySelector('form') as HTMLFormElement
              const name = form?.querySelector<HTMLInputElement>('[name="business_name"]')?.value
              const whatsapp = form?.querySelector<HTMLInputElement>('[name="whatsapp"]')?.value
              const review = form?.querySelector<HTMLInputElement>('[name="google_review_url"]')?.value
              if (!name || !whatsapp || !review) {
                setError('Please provide Business Name, Google Review Link, and WhatsApp Number.')
                return
              }
              setError(null)
              setStep(2)
            }} className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-8 h-11 text-[15px] font-medium rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-slate-900 dark:focus:ring-white">
              Continue
            </Button>
          </div>
        </div>

        {/* STEP 2: Payment */}
        <div className={step === 2 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}>
          <div className="mb-8">
            <button type="button" onClick={() => setStep(1)} className="text-[13px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors flex items-center gap-1.5 mb-6">
              <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Profile
            </button>
            <h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-slate-50 mb-2">Complete activation</h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px]">Scan the QR code to activate your account.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-10">
            {/* Payment Details */}
            <div className="flex-1 space-y-6">
              <div className="bg-slate-50/50 dark:bg-[#111] p-6 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">Pro Plan Setup</h3>
                    <p className="text-[13px] text-slate-500">One-time activation fee</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-slate-900 dark:text-slate-100">₹999</div>
                    <div className="text-[12px] text-slate-400 line-through">₹1999</div>
                  </div>
                </div>
                
                <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800 mb-6" />
                
                <div className="flex justify-between items-center mb-2 text-[14px]">
                  <span className="text-slate-600 dark:text-slate-400">Monthly subscription</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[13px]">1st month free</span>
                </div>
                <p className="text-[12px] text-slate-500 mb-6">Renews at ₹399/mo after 30 days. Cancel anytime.</p>
                
                <div className="flex justify-between items-center font-medium text-[17px] text-slate-900 dark:text-slate-100">
                  <span>Total due today</span>
                  <span>₹999</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-800 dark:text-emerald-400/80 text-[13px] p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-500/10">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
                <p className="leading-relaxed">Scan the QR code using any UPI app (GPay, PhonePe, Paytm). After payment, click the button below to instantly verify and activate.</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4">
                <div className="w-44 h-44 rounded-lg overflow-hidden border border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/payment-qr.jpg" alt="UPI QR Code" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100 mb-0.5">Mr Joyeb Khan</p>
                <p className="text-[12px] text-slate-500 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 inline-block" />
                  Verified Merchant
                </p>
              </div>
            </div>
          </div>

          <input type="hidden" name="plan" value="pro" />

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-8 mt-4">
            <Button type="submit" className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 h-12 text-[15px] font-medium rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-slate-900 dark:focus:ring-white relative overflow-hidden group" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verifying Payment...
                </span>
              ) : 'I have completed the payment'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

