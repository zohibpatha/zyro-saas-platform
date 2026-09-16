import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Restaurant, FoodPhoto } from '@/lib/types'
import RestaurantForm from '@/components/restaurant-form'
import QRCodeGenerator from '@/components/qr-code-generator'
import FoodPhotosManager from '@/components/food-photos-manager'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch owner's restaurants with food photos
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*, food_photos(*)')
    .eq('owner_email', user.email!)
    .order('created_at', { ascending: false })

  if (!restaurants || restaurants.length === 0) {
    redirect('/login?error=no-restaurant')
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Restaurant</h1>
        <p className="text-muted-foreground mt-1">Manage your digital presence</p>
      </div>

      {restaurants.map((restaurant: Restaurant & { food_photos: FoodPhoto[] }) => (
        <div key={restaurant.id} className="space-y-8">
          {/* Public Link & QR Code Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Public Link</CardTitle>
                <CardDescription>Share this link with your customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 text-sm">
                    {siteUrl}/r/{restaurant.slug}
                  </code>
                  <Link
                    href={`/r/${restaurant.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>Download and print for your restaurant</CardDescription>
              </CardHeader>
              <CardContent>
                <QRCodeGenerator slug={restaurant.slug} restaurantName={restaurant.name} />
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
              <CardDescription>Update your restaurant information</CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantForm restaurant={restaurant} />
            </CardContent>
          </Card>

          <Separator />

          {/* Food Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Food Photos</CardTitle>
              <CardDescription>Showcase your best dishes</CardDescription>
            </CardHeader>
            <CardContent>
              <FoodPhotosManager
                restaurantId={restaurant.id}
                initialPhotos={restaurant.food_photos || []}
              />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
