'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Loader2, MapPin, Phone, Building2, Link as LinkIcon, ShieldCheck } from 'lucide-react'
import { startFreeTrial } from '@/actions/trial'

export default function TrialClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const saarthiCode = searchParams.get('ref') || ''
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await startFreeTrial(formData)
      if (result.error) throw new Error(result.error)
      
      // Navigate to dashboard with welcome flag
      router.push(`/manage/${result.slug}?trial_started=true`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Anti-Fraud Banner */}
        <div className="absolute top-0 left-0 right-0 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-100 dark:border-amber-800/50 p-2 text-center text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Strictly 1 Trial per Business Location
        </div>

        <div className="mt-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Let's set up your profile <Sparkles className="w-5 h-5 text-indigo-500" />
          </h2>
          <p className="text-slate-500 text-sm mt-1">Takes 30 seconds. No credit card required.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {saarthiCode && <input type="hidden" name="saarthi_code" value={saarthiCode} />}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" /> Business Name
            </label>
            <input 
              type="text" 
              name="name"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. The Rustic Cafe"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-slate-400" /> Your Zairo Link
            </label>
            <div className="flex gap-2 items-center">
              <span className="text-slate-400 text-sm font-mono truncate">zairo.in/r/</span>
              <input 
                type="text" 
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Business Type</label>
            <select 
              name="business_type"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="Restaurant">Restaurant</option>
              <option value="Cafe">Cafe</option>
              <option value="Hotel & Restaurant">Hotel & Restaurant</option>
              <option value="Hotel">Hotel</option>
              <option value="Gym">Gym / Fitness</option>
              <option value="Salon">Salon</option>
              <option value="Retail">Retail Store</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> WhatsApp Number
              </label>
              <input 
                type="tel" 
                name="phone"
                required
                minLength={10}
                placeholder="10-digit number"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Google Maps URL
              </label>
              <input 
                type="url" 
                name="google_maps_url"
                required
                placeholder="https://maps.app.goo.gl/..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">We require your Google Maps URL to verify your business location and prevent trial abuse.</p>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Creating your QR Page...</>
            ) : (
              'Start 7-Day Free Trial'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
