import { Badge } from '@/components/ui/badge'
import type { Restaurant } from '@/lib/types'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        {restaurant.logo_url ? (
          <img
            src={restaurant.logo_url}
            alt={restaurant.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <span className="text-lg font-bold text-muted-foreground">
              {restaurant.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground">/r/{restaurant.slug}</p>
        </div>
      </div>
      <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
        {restaurant.is_active ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  )
}
