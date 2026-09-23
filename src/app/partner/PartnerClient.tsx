'use client'

import { useState } from 'react'
import { createAffiliateProfile, requestWithdrawal } from '@/actions/affiliate'
import { Loader2, Copy, CheckCircle2, IndianRupee, TrendingUp, History, AlertCircle } from 'lucide-react'

interface PartnerClientProps {
  initialProfile: any
  ledger: any[]
  userEmail: string
}

export default function PartnerClient({ initialProfile, ledger, userEmail }: PartnerClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  // Onboarding Form State
  const [name, setName] = useState('')
  const [upi, setUpi] = useState('')
  const [code, setCode] = useState('')

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('name', name)
    formData.append('upi_id', upi)
    formData.append('saarthi_code', code)
    
    const res = await createAffiliateProfile(formData)
    
    if (res.error) {
      setError(res.error)
    } else {
      // Reload page to get server state
      window.location.reload()
    }
    
    setIsLoading(false)
  }

  const handleWithdrawal = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    const res = await requestWithdrawal()
    
    if (res.error) {
      setError(res.error)
    } else {
      setSuccess('Withdrawal requested successfully! It will be processed soon.')
      // Update local state to reflect 0 balance
      setProfile({ ...profile, wallet_balance: 0 })
      // Ledger will update on next refresh
    }
    
    setIsLoading(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(profile.saarthi_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnWhatsApp = () => {
    const text = `Hey! I'm partnering with Zairo. Use my VIP code *${profile.saarthi_code}* when you sign up your restaurant to get a special offer! Sign up here: ${window.location.origin}/pricing`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 px-6 py-8 text-center">
            <h2 className="text-2xl font-bold text-white">Become a Zairo Saarthi</h2>
            <p className="mt-2 text-slate-300 text-sm">Earn ₹100 for every restaurant you bring, and ₹20 every month they renew.</p>
          </div>
          
          <form onSubmit={handleOnboarding} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rahul Sharma"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your UPI ID (For Payouts)</label>
              <input
                type="text"
                required
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="rahul@okicici"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Choose your VIP Code</label>
              <input
                type="text"
                required
                maxLength={15}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                placeholder="RAHUL99"
              />
              <p className="text-xs text-slate-500 mt-1">This is what restaurants will enter at checkout.</p>
            </div>
            
            <div className="flex items-start gap-2 pt-2">
              <input type="checkbox" required className="mt-1" id="terms" />
              <label htmlFor="terms" className="text-xs text-slate-600">
                I agree to the Referral Terms. I understand I am an independent contractor responsible for my own taxes, and I agree to provide my PAN if my earnings reach ₹20,000 this financial year.
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Affiliate Account'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const canWithdraw = profile.wallet_balance >= 500

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {profile.name.split(' ')[0]}!</h1>
            <p className="text-slate-400 mt-1">Zairo Saarthi Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Total Earned</p>
            <p className="text-2xl font-bold text-emerald-400 flex items-center justify-end">
              <IndianRupee className="w-5 h-5" />
              {profile.total_earned}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Code Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-500 mb-2">Your VIP Partner Code</p>
            <div className="bg-slate-100 rounded-xl px-6 py-4 mb-4 flex items-center gap-3">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-wider">{profile.saarthi_code}</span>
              <button 
                onClick={copyCode}
                className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-900"
              >
                {copied ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
            <button 
              onClick={shareOnWhatsApp}
              className="w-full max-w-xs py-2.5 bg-[#25D366] text-white rounded-lg font-medium hover:bg-[#128C7E] transition-colors"
            >
              Share via WhatsApp
            </button>
          </div>

          {/* Wallet Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-medium">Current Balance</h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-5xl font-black text-slate-900 flex items-center mb-2">
                <IndianRupee className="w-8 h-8 mr-1 text-slate-400" />
                {profile.wallet_balance}
              </div>
              <p className="text-sm text-slate-500 mb-6">
                UPI: <span className="font-medium">{profile.upi_id}</span>
              </p>
              
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              {success && <p className="text-emerald-500 text-sm mb-3">{success}</p>}
              
              <button 
                onClick={handleWithdrawal}
                disabled={!canWithdraw || isLoading}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  canWithdraw 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Withdraw to UPI'}
              </button>
              {!canWithdraw && (
                <p className="text-xs text-center text-slate-400 mt-2">Minimum withdrawal is ₹500</p>
              )}
            </div>
          </div>
        </div>

        {/* Ledger */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-900">Transaction History</h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {ledger.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No transactions yet. Start sharing your code!
              </div>
            ) : (
              ledger.map((entry) => (
                <div key={entry.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {entry.type === 'signup_commission' && 'New Signup Commission'}
                      {entry.type === 'renewal_commission' && 'Renewal Commission'}
                      {entry.type === 'withdrawal' && 'Withdrawal Request'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      {entry.status === 'pending' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                      )}
                      {entry.status === 'completed' && entry.type === 'withdrawal' && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Paid</span>
                      )}
                    </div>
                  </div>
                  <div className={`text-lg font-bold flex items-center ${entry.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                    {entry.amount > 0 ? '+' : ''}₹{Math.abs(entry.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
