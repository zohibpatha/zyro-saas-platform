import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/server'
import CheckoutClient from './checkout-client'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: admin } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', user.email!)
      .maybeSingle()
    if (admin) isAdmin = true
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-indigo-500/30">
      <Navbar user={user ? { email: user.email! } : null} isAdmin={isAdmin} />
      
      <main className="flex-1 flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white mb-4">
            Complete your purchase
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Follow the instructions below to activate your Pro plan.
          </p>
        </div>
        
        <div className="w-full max-w-4xl mx-auto">
          <CheckoutClient />
        </div>
      </main>
    </div>
  )
}
