'use client'

import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Gift, CalendarDays, Ticket, Loader2 } from 'lucide-react'

export function LuckySpin({ onWin }: { onWin: (prize: string) => void }) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [wonPrize, setWonPrize] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)

  // Configuration for the wheel
  const prizes = [
    { label: "2% OFF", color: "#FF3B30", probability: 0.45 },
    { label: "5% OFF", color: "#FF9500", probability: 0.35 },
    { label: "10% OFF", color: "#4CD964", probability: 0.10 },
    { label: "30% OFF", color: "#5AC8FA", probability: 0.04 },
    { label: "50% OFF", color: "#007AFF", probability: 0.01 },
    { label: "TRY AGAIN", color: "#5856D6", probability: 0.05 }
  ]

  const numSlices = prizes.length
  const sliceAngle = 360 / numSlices

  const spinWheel = () => {
    if (isSpinning || wonPrize) return
    setIsSpinning(true)
    
    const rand = Math.random()
    let cumulative = 0
    let winningIndex = 0
    for (let i = 0; i < prizes.length; i++) {
      cumulative += prizes[i].probability
      if (rand <= cumulative) {
        winningIndex = i
        break
      }
    }

    // Calculate rotation to stop exactly at the winning slice
    // Pointer is at the top (0 degrees or 360 degrees).
    // The winning slice's center must end up at the top.
    const sliceCenterAngle = winningIndex * sliceAngle + (sliceAngle / 2)
    // We want to rotate so that (sliceCenterAngle + finalRotation) % 360 = 360 (or 0)
    const extraSpins = 5 * 360 // Spin 5 times
    const targetRotation = extraSpins + (360 - sliceCenterAngle)
    
    // Add some randomness within the slice so it doesn't land exactly in the center every time
    const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.8)
    const finalRotation = rotation + targetRotation + randomOffset - (rotation % 360)

    setRotation(finalRotation)
    
    setTimeout(() => {
      setWonPrize(prizes[winningIndex].label)
      setIsSpinning(false)
      onWin(prizes[winningIndex].label)
    }, 4000) // 4 seconds spin duration
  }

  // Math helper for drawing SVG slices
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", x, y,
      "L", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-xl overflow-hidden relative border-2 border-white/50 dark:border-slate-700">
      <div className="absolute top-0 right-0 p-4 animate-pulse">
        <Gift className="w-8 h-8 text-rose-500 opacity-80" />
      </div>
      
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center drop-shadow-sm">Scan & Spin!</h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm font-medium text-center mb-6">Test your luck to win a massive discount on your bill right now.</p>
      
      <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-slate-900 dark:border-t-white drop-shadow-xl z-20" />
        
        {/* The Wheel */}
        <div 
          className="w-full h-full rounded-full border-4 border-slate-900 dark:border-white shadow-2xl relative overflow-hidden bg-slate-100"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {prizes.map((prize, index) => {
              const startAngle = index * sliceAngle;
              const endAngle = (index + 1) * sliceAngle;
              const pathData = describeArc(100, 100, 100, startAngle, endAngle);
              const textAngle = startAngle + sliceAngle / 2;
              
              return (
                <g key={index}>
                  <path d={pathData} fill={prize.color} stroke="white" strokeWidth="1" />
                  <text 
                    x="100" y="30" 
                    transform={`rotate(${textAngle}, 100, 100)`} 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="12" 
                    fontWeight="900"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {prize.label}
                  </text>
                </g>
              )
            })}
          </svg>
          
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-slate-900 dark:border-slate-700 shadow-inner flex items-center justify-center z-10">
            <div className="w-4 h-4 bg-slate-900 rounded-full" />
          </div>
        </div>
      </div>

      {wonPrize ? (
        <div className="text-center animate-in zoom-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border-2 border-rose-100 w-full">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">🎉 You Won 🎉</p>
          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mb-2">{wonPrize}</p>
          <p className="text-xs font-semibold text-slate-400">Show this screen at the billing counter.</p>
        </div>
      ) : (
        <Button 
          onClick={spinWheel} 
          disabled={isSpinning}
          className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-lg h-14 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
          {isSpinning ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
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
