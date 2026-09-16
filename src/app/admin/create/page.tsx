import RestaurantForm from '@/components/restaurant-form'

export default function CreateRestaurantPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Restaurant</h1>
      <RestaurantForm isAdmin={true} />
    </div>
  )
}
