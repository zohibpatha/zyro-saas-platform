import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Store, MessageCircle, ArrowRight } from 'lucide-react'
import Navbar from '@/components/navbar'
import PortalClientError from './error-handler'

export default async function ClientPortalPage() {
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

  async function handleLogin(formData: FormData) {
    'use server'
    const whatsapp = formData.get('whatsapp') as string
    
    if (!whatsapp) {
      redirect('/portal?error=Please enter your WhatsApp number')
    }

    const supabaseServer = await createClient()
    
    const { data: restaurant, error } = await supabaseServer
      .from('restaurants')
      .select('slug, is_active')
      .eq('whatsapp', whatsapp.trim())
      .maybeSingle()

    if (error || !restaurant) {
      redirect('/portal?error=No business found with this registered number')
    }

    redirect('/manage/' + restaurant.slug)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={user ? { email: user.email! } : null} isAdmin={isAdmin} />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Store className="w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            Partner Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            Enter your registered WhatsApp number to access your business dashboard.
          </p>

          <PortalClientError />

          <form action={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="whatsapp" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                WhatsApp Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MessageCircle className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  required
                  placeholder="+91 98765 43210"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full group bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Access Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
             <p className="text-sm text-slate-500">
               Client Magic Link Login System
             </p>
          </div>
        </div>
      </main>
    </div>
  )
}
