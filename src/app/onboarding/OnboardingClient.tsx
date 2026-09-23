'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, ArrowRight } from 'lucide-react'
import { submitOnboarding } from '@/actions/onboarding'

export default function OnboardingClient({ sessionId }: { sessionId: string }) {
  const router = useRouter()
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
      const result = await submitOnboarding(formData, sessionId)
      if (result.error) throw new Error(result.error)
      
      // Navigate to dashboard
      router.push(`/manage/${result.slug}?welcome=true`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Let's set up your profile</h2>
            <p className="text-slate-500 text-sm">Step 1 of 1: Basic Info</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Business Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. The Rustic Cafe"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Business Type</label>
            <select 
              name="business_type"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="Restaurant">Restaurant</option>
              <option value="Cafe">Cafe</option>
              <option value="Hotel & Restaurant">Hotel & Restaurant</option>
              <option value="Hotel">Hotel</option>
              <option value="Gym">Gym / Fitness</option>
              <option value="Salon">Salon</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Link</label>
            <div className="flex gap-2 items-center">
              <span className="text-slate-400 text-sm font-mono truncate">zairo.in/r/</span>
              <input 
                type="text" 
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">This is the link your customers will see. You can print it as a QR code.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Brand Color</label>
            <div className="flex gap-4 items-center">
              <input 
                type="color" 
                name="primary_color"
                defaultValue="#111111"
                className="w-12 h-12 rounded cursor-pointer"
              />
              <p className="text-xs text-slate-500">Pick a color that matches your brand.</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm font-medium border border-rose-100 dark:border-rose-500/20">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:opacity-70 mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create My Dashboard'} <ArrowRight className="w-5 h-5" />
          </button>
          
        </form>
      </div>
    </div>
  )
}
