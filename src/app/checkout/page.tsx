import Navbar from '@/components/navbar'
import CheckoutClient from './CheckoutClient'
import { createClient } from '@/lib/supabase/server'

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Navbar user={user ? { email: user.email! } : null} isAdmin={isAdmin} />
      
      <main className="flex-1 flex flex-col items-center pt-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            Complete your subscription
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Get instant access. Start building your digital presence today.
          </p>
        </div>

        <CheckoutClient />
      </main>
    </div>
  )
}
