export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  logo_url: string | null;
  cover_image: string | null;
  instagram_url: string | null;
  google_maps_url: string | null;
  google_review_url: string | null;
  website_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  loyalty_offer?: string;
  reward_stamps?: number;
  primary_color: string;
  is_active: boolean;
  owner_email: string;
  created_at: string;
  updated_at: string;
}

export interface FoodPhoto {
  id: string;
  restaurant_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export interface PrivateFeedback {
  id: string;
  restaurant_id: string;
  rating: number;
  message: string | null;
  created_at: string;
}

export interface LoyaltyCustomer {
  id: string;
  restaurant_id: string;
  phone: string;
  name: string | null;
  visits: number;
  last_visit: string;
  created_at: string;
}

export interface RestaurantWithPhotos extends Restaurant {
  food_photos: FoodPhoto[];
  private_feedback?: PrivateFeedback[];
  loyalty_customers?: LoyaltyCustomer[];
}
