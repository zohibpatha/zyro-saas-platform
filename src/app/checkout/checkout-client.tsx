'use client'

import { useState } from 'react'
import { QrCode, ShieldCheck, CheckCircle2, Store, Globe, Instagram, MessageCircle, MapPin, Star, Link2, Copy, Check } from 'lucide-react'
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

  // SUCCESS STATE — Dashboard is Ready!
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Your Business is Live! 🎉</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
          Aapka digital profile aur QR code turant activate ho gaya hai! Niche apna link copy karein aur QR code print karke apni shop par lagayein.
        </p>
        
        {qrPageUrl && (
          <div className="w-full max-w-md space-y-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Your Live QR Page</p>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                <Link2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-mono truncate flex-1">{qrPageUrl}</span>
                <button onClick={() => copyLink(qrPageUrl)} className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              <p className="text-xs text-green-600 font-medium mt-2">✅ Live & Active — Share this link or print QR code!</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          {qrPageUrl && (
            <a href={qrPageUrl} target="_blank" className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20">
              Open My Page →
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Progress Steps */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <div className={`flex-1 py-4 text-center text-sm font-semibold transition-colors ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-400'}`}>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs mr-2">1</span>
          Business Details
        </div>
        <div className={`flex-1 py-4 text-center text-sm font-semibold transition-colors ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-400'}`}>
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-2 ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>2</span>
          Payment
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-10">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl border border-red-100 dark:border-red-900/50 mb-6">
            {error}
          </div>
        )}

        {/* STEP 1: Business Details */}
        <div className={step === 1 ? 'block' : 'hidden'}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tell us about your business</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">We&apos;ll set up your digital profile and QR code page automatically.</p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="business_name" className="flex items-center gap-2 text-sm font-medium">
                  <Store className="w-4 h-4 text-indigo-500" /> Business Name *
                </Label>
                <Input id="business_name" name="business_name" placeholder="e.g. Darbar E Bhopal" required className="h-11 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business_type" className="flex items-center gap-2 text-sm font-medium">
                  <Store className="w-4 h-4 text-indigo-500" /> Business Type *
                </Label>
                <select id="business_type" name="business_type" required className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm">
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_review_url" className="flex items-center gap-2 text-sm font-medium">
                <Star className="w-4 h-4 text-amber-500" /> Google Review Link *
              </Label>
              <Input id="google_review_url" name="google_review_url" placeholder="https://g.page/review/... or paste your Google Maps link" required className="h-11 rounded-xl" />
              <p className="text-xs text-slate-500">This is the most important link — customers will be redirected here to leave reviews.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_maps_url" className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-red-500" /> Google Maps Link
              </Label>
              <Input id="google_maps_url" name="google_maps_url" placeholder="https://maps.google.com/..." className="h-11 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="instagram_url" className="flex items-center gap-2 text-sm font-medium">
                  <Instagram className="w-4 h-4 text-pink-500" /> Instagram Link
                </Label>
                <Input id="instagram_url" name="instagram_url" placeholder="https://instagram.com/yourbusiness" className="h-11 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website_url" className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="w-4 h-4 text-blue-500" /> Website URL
                </Label>
                <Input id="website_url" name="website_url" placeholder="https://yourbusiness.com" className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-medium">
                <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp Number *
              </Label>
              <Input id="whatsapp" name="whatsapp" type="tel" placeholder="+91 98765 43210" required className="h-11 rounded-xl" />
              <p className="text-xs text-slate-500">We&apos;ll activate your dashboard and send login on this number.</p>
            </div>
          </div>

          <div className="mt-8">
            <Button type="button" onClick={() => {
              const form = document.querySelector('form') as HTMLFormElement
              const name = form?.querySelector<HTMLInputElement>('[name="business_name"]')?.value
              const whatsapp = form?.querySelector<HTMLInputElement>('[name="whatsapp"]')?.value
              const review = form?.querySelector<HTMLInputElement>('[name="google_review_url"]')?.value
              if (!name || !whatsapp || !review) {
                setError('Please fill in Business Name, Google Review Link, and WhatsApp Number.')
                return
              }
              setError(null)
              setStep(2)
            }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold rounded-xl transition-all">
              Continue to Payment →
            </Button>
          </div>
        </div>

        {/* STEP 2: Payment */}
        <div className={step === 2 ? 'block' : 'hidden'}>
          <button type="button" onClick={() => setStep(1)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 flex items-center gap-1">
            ← Back to Business Details
          </button>

          <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* QR Code Placeholder */}
            <div className="shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <div className="w-40 h-40 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center mb-3 border border-dashed border-slate-300 dark:border-slate-700">
                <QrCode className="w-14 h-14 text-slate-400" />
              </div>
              <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white mb-1">your-upi-id@bank</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scan to pay</p>
            </div>

            {/* Payment Details — ONLY Setup Fee */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro Plan — Setup Fee</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Pay via any UPI app (GPay, PhonePe, Paytm)</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">One-time Setup Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-slate-400 text-xs">₹1999</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹999</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Monthly fee (₹399/mo)</span>
                  <span className="text-green-600 font-medium">FREE for 1st month!</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-bold text-lg">
                  <span className="text-slate-900 dark:text-white">Pay Now</span>
                  <span className="text-indigo-600 dark:text-indigo-400">₹999</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg inline-flex">
                <ShieldCheck className="w-4 h-4" />
                First month FREE — Monthly starts next month
              </div>
            </div>
          </div>

          {/* Hidden field for plan */}
          <input type="hidden" name="plan" value="pro" />

          <div className="space-y-6 max-w-lg mx-auto">
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm p-4 rounded-xl border border-green-100 dark:border-green-900/50 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <span>UPI se ₹999 pay karein, phir niche button dabayein. Aapka business <strong>turant activate</strong> ho jayega!</span>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20" disabled={loading}>
              {loading ? '⚡ Activating your business...' : '✅ Maine Pay Kar Diya — Activate Karo!'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
