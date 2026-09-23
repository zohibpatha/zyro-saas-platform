import RestaurantForm from '@/components/restaurant-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CreateRestaurantPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle()

  if (!adminUser) {
    return <div className="p-8 text-red-500 font-bold text-center mt-20 text-2xl">Unauthorized.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Restaurant</h1>
      <RestaurantForm isAdmin={true} />
    </div>
  )
}
