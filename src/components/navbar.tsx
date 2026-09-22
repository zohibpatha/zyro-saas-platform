'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Menu, X, LayoutDashboard, UtensilsCrossed, LogOut, Hexagon } from 'lucide-react'

export default function Navbar({ user, isAdmin }: { user?: { email: string } | null, isAdmin?: boolean }) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="w-full bg-transparent relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <Hexagon className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Zyro</span>
            </Link>
            
            <div className="hidden sm:flex sm:space-x-1 pl-4 border-l border-gray-200 dark:border-gray-800">
              <Link href="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                Pricing
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <Link href="/trial">
              <Button size="sm" className="h-9 px-5 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full font-medium transition-all shadow-md shadow-black/10">Start 7-Day Free Trial</Button>
            </Link>
          </div>

          <div className="flex items-center sm:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 rounded-full bg-gray-100/50" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden absolute top-16 left-4 right-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xl shadow-black/5 backdrop-blur-xl z-50">
          <div className="space-y-2">
            <Link href="/pricing" className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              Pricing
            </Link>
            <Link href="/trial" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              Start 7-Day Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
