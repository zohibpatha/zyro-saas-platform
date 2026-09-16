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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ email: user.email! }} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
