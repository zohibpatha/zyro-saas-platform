import { createClient } from '@/lib/supabase/server'
import RestaurantForm from '@/components/restaurant-form'
import FoodPhotosManager from '@/components/food-photos-manager'
import { notFound } from 'next/navigation'

export default async function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*, food_photos(*)')
    .eq('id', id)
    .single()

  if (!restaurant) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit Restaurant: {restaurant.name}</h1>
        <RestaurantForm restaurant={restaurant} isAdmin={true} />
      </div>

      <div className="pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Food Photos</h2>
        <FoodPhotosManager restaurantId={restaurant.id} initialPhotos={restaurant.food_photos || []} />
      </div>
    </div>
  )
}
