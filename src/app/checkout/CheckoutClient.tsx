'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, Loader2, IndianRupee, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') || '399'
  const isRenewal = !!searchParams.get('restaurant_id')
  const restaurantId = searchParams.get('restaurant_id')
  
  // Base monthly cost
  const monthlyCost = parseInt(planParam, 10) || 399
  
  // Calculate total amount
  let totalAmount = monthlyCost
  let setupFee = 0
  
  if (!isRenewal) {
    if (monthlyCost === 199) setupFee = 499
    else if (monthlyCost === 399) setupFee = 999
    else if (monthlyCost === 699) setupFee = 1499
    
    // As per new offer: First month is ONLY setup fee
    totalAmount = setupFee
  }
  
  const [phoneNumber, setPhoneNumber] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const upiId = '7067615270@ybl' // Replace with your actual UPI ID
  const payeeName = 'Zyro'
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&cu=INR`

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid WhatsApp number')
      return
    }
    if (!file) {
      setError('Please upload the payment screenshot')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const supabase = createClient()
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(`payments/${fileName}`, file)

      if (uploadError) throw new Error('Failed to upload screenshot. Please try again.')

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(`payments/${fileName}`)

      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          amount: totalAmount,
          screenshot_url: publicUrl,
          months: 1,
          restaurant_id: searchParams.get('restaurant_id') || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed')
      }

      if (result.isRenewal) {
        router.push(`/manage/${result.slug}?renewed=true`)
      } else {
        router.push(`/onboarding?session=${result.sessionId}`)
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-12 mb-24">
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Make Payment</h2>
            <p className="text-slate-500">Pay directly via your favorite UPI app</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 text-center">
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">₹{totalAmount}</div>
          {isRenewal ? (
            <p className="text-sm text-slate-500 font-medium mb-6">Subscription Renewal (28 Days)</p>
          ) : (
            <div className="mb-6">
              <p className="text-sm text-slate-500 font-medium mb-1">
                One-time Setup Fee (28 Days Access Included)
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 inline-block px-2 py-1 rounded">
                🎉 Offer: Monthly fee (₹{monthlyCost}) waived for the first month!
              </p>
            </div>
          )}
          
          <a 
            href={upiLink}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#128C7E] py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95 md:hidden"
          >
            Pay with UPI App
          </a>
          
          <div className="hidden md:block">
            <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-slate-200">
               <img 
                 src="/payment-qr.png" 
                 alt="UPI QR Code" 
                 className="w-48 h-48 mx-auto rounded-lg object-contain"
               />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">Scan this QR with PhonePe, GPay, or Paytm</p>
          </div>

          <div className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            UPI ID: <span className="font-mono text-indigo-600 dark:text-indigo-400 select-all">{upiId}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 shrink-0">1</div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Complete the payment</h4>
              <p className="text-sm text-slate-500">Use the button or QR code above to pay ₹{totalAmount}.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 shrink-0">2</div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Take a screenshot</h4>
              <p className="text-sm text-slate-500">Capture the success screen showing the amount and date.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-indigo-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify & Activate</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">WhatsApp Number</label>
            <p className="text-xs text-slate-500 mb-2">We use this to create your account and send updates.</p>
            <input 
              type="tel" 
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Payment Screenshot</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${previewUrl ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              {previewUrl ? (
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                  <img src={previewUrl} alt="Screenshot Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Click to upload screenshot</p>
                  <p className="text-xs text-slate-500 mt-1">JPEG, PNG up to 5MB</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm font-medium border border-rose-100 dark:border-rose-500/20">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isVerifying}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all disabled:opacity-70"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying with AI...
              </>
            ) : (
              'Verify & Continue Setup'
            )}
          </button>
          
          <p className="text-center text-xs text-slate-500">
            By continuing, you agree to our Terms of Service. Instant activation is subject to manual audit.
          </p>

        </form>
      </div>

    </div>
  )
}
