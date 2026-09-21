'use client'

import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Gift, CalendarDays, Ticket, Loader2 } from 'lucide-react'

export function LuckySpin({ onWin }: { onWin: (prize: string) => void }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [wonPrize, setWonPrize] = useState<string | null>(null)
  
  const prizes = ["5% OFF", "10% OFF", "FREE SOCKS", "₹100 WALLET", "Better luck next time!", "2% OFF"]

  const spinWheel = () => {
    if (isSpinning || wonPrize) return
    setIsSpinning(true)
    
    // Simulate spinning delay
    setTimeout(() => {
      // Pick a random prize, weighted heavily towards smaller discounts
      const rand = Math.random()
      let prizeIndex = 5; // 2% off default
      if (rand > 0.9) prizeIndex = 1; // 10%
      else if (rand > 0.7) prizeIndex = 0; // 5%
      else if (rand > 0.5) prizeIndex = 2; // Socks
      else if (rand > 0.3) prizeIndex = 3; // Wallet
      else if (rand > 0.1) prizeIndex = 4; // Better luck
      
      const prize = prizes[prizeIndex]
      setWonPrize(prize)
      setIsSpinning(false)
      onWin(prize)
    }, 2500)
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
        <Gift className="w-6 h-6 text-indigo-500 opacity-20" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Lucky Spin Discount!</h3>
      <p className="text-slate-500 text-sm text-center mb-6">Spin the wheel to win a surprise discount on your purchase today.</p>
      
      <div className="relative w-48 h-48 mb-8">
        {/* Simple CSS Wheel Representation */}
        <div 
          className={`w-full h-full rounded-full border-4 border-indigo-500 flex items-center justify-center bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 transition-transform duration-[2500ms] ease-out shadow-inner`}
          style={{ transform: isSpinning ? 'rotate(1080deg)' : 'rotate(0deg)' }}
        >
          {/* Wheel lines */}
          <div className="absolute w-full h-[2px] bg-indigo-200 dark:bg-indigo-700 rotate-0" />
          <div className="absolute w-full h-[2px] bg-indigo-200 dark:bg-indigo-700 rotate-45" />
          <div className="absolute w-full h-[2px] bg-indigo-200 dark:bg-indigo-700 rotate-90" />
          <div className="absolute w-full h-[2px] bg-indigo-200 dark:bg-indigo-700 rotate-[135deg]" />
          
          <div className="z-10 bg-white dark:bg-slate-800 w-12 h-12 rounded-full border-2 border-indigo-500 flex items-center justify-center shadow-lg">
            <Ticket className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        
        {/* Pointer */}
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-rose-500 drop-shadow-md z-20" />
      </div>

      {wonPrize ? (
        <div className="text-center animate-in zoom-in duration-300">
          <p className="text-sm font-medium text-slate-500 mb-1">You won:</p>
          <p className="text-3xl font-black text-rose-500 mb-4">{wonPrize}</p>
          <p className="text-xs text-slate-400">Show this screen at the billing counter.</p>
        </div>
      ) : (
        <Button 
          onClick={spinWheel} 
          disabled={isSpinning}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold h-12 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          {isSpinning ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Spinning...
            </>
          ) : (
            "TAP TO SPIN!"
          )}
        </Button>
      )}
    </div>
  )
}

export function VipClubForm({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (details: {name: string, phone: string, dob: string, anniversary: string}) => void,
  isLoading: boolean
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [anniversary, setAnniversary] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !dob) {
      setError("Please fill all required fields")
      return
    }
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number")
      return
    }
    setError('')
    onSubmit({ name, phone, dob, anniversary })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl border border-rose-100 dark:border-rose-900/30">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="vip-name">Full Name *</Label>
        <Input 
          id="vip-name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Sharma" 
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vip-phone">WhatsApp Number *</Label>
        <Input 
          id="vip-phone" 
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))}
          placeholder="10-digit mobile number" 
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vip-dob">Birthday *</Label>
          <div className="relative">
            <Input 
              id="vip-dob" 
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="pl-10"
            />
            <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vip-anniversary">Anniversary</Label>
          <div className="relative">
            <Input 
              id="vip-anniversary" 
              type="date"
              value={anniversary}
              onChange={(e) => setAnniversary(e.target.value)}
              className="pl-10"
            />
            <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-medium h-12 rounded-xl mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining VIP Club...
          </>
        ) : (
          "Join VIP Club & Save Discount"
        )}
      </Button>
      <p className="text-xs text-center text-slate-500 mt-2">
        We will only message you for birthday discounts and exclusive flash sales.
      </p>
    </form>
  )
}
