'use client'

import { useState } from 'react'
import { QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { submitManualPayment } from '@/actions/checkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CheckoutClient() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Payment received!</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md">
          Our team will verify your payment and activate your account within 2 hours on WhatsApp. We'll be in touch!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-8 md:p-10 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-8 bg-slate-50 dark:bg-slate-900/50">
        {/* QR Code Placeholder */}
        <div className="shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
          <div className="w-48 h-48 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 border border-dashed border-slate-300 dark:border-slate-700">
            <QrCode className="w-16 h-16 text-slate-400" />
          </div>
          <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white mb-1">your-upi-id@bank</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Scan to pay ₹1,398</p>
        </div>

        {/* Payment Details */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro Plan Subscription</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Pay via any UPI app (GPay, PhonePe, Paytm)</p>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">One-time Setup Fee</span>
              <span className="font-medium text-slate-900 dark:text-white">₹999</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">First Month Subscription</span>
              <span className="font-medium text-slate-900 dark:text-white">₹399</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-bold text-lg">
              <span className="text-slate-900 dark:text-white">Total Amount</span>
              <span className="text-indigo-600 dark:text-indigo-400">₹1,398</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg inline-flex">
            <ShieldCheck className="w-4 h-4" />
            Secure Manual Verification
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="utr">UTR / Transaction Reference Number</Label>
            <Input 
              id="utr" 
              name="utr" 
              placeholder="e.g. 123456789012" 
              required 
              className="font-mono"
            />
            <p className="text-xs text-slate-500">12-digit number found in your UPI app's transaction details</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input 
              id="whatsapp" 
              name="whatsapp" 
              type="tel" 
              placeholder="+91 98765 43210" 
              required 
            />
            <p className="text-xs text-slate-500">We'll contact you here to activate your account</p>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Payment Details'}
          </Button>
        </form>
      </div>
    </div>
  )
}
