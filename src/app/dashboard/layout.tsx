import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Verify user owns at least one restaurant
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_email', user.email!)
    .limit(1)

  if (!restaurants || restaurants.length === 0) {
    // User is authenticated but doesn't own any restaurant
    redirect('/login?error=no-restaurant')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-indigo-100 selection:text-indigo-900 relative">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-50 dark:from-indigo-900/20 dark:via-slate-950 dark:to-slate-950"></div>
      
      {/* Floating Top Nav */}
      <div className="relative z-10 pt-6 px-4 md:px-8">
        <div className="max-w-6xl mx-auto backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
          <Navbar user={{ email: user.email! }} />
        </div>
      </div>
      
      <main className="relative z-10 container max-w-6xl mx-auto px-4 py-12">
        {children}
      </main>
    </div>
  )
}
