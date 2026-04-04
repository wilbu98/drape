export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location_city: string | null
  location_lat: number | null
  location_lng: number | null
  style_preferences: string[]
  activity_defaults: string[]
  is_public: boolean
  created_at: string
}

export interface WardrobeItem {
  id: string
  user_id: string
  name: string
  category: string
  subcategory: string | null
  colors: string[]
  brand: string | null
  photo_url: string | null
  purchase_url: string | null
  tags: string[]
  last_worn_at: string | null
  times_worn: number
  source: string
  created_at: string
}

export interface GeneratedOutfit {
  id: string
  user_id: string
  item_ids: string[]
  generated_at: string
  weather_temp: number | null
  weather_condition: string | null
  activity_type: string | null
  accepted: boolean
  worn: boolean
}

export interface OutfitPost {
  id: string
  user_id: string
  photo_url: string
  caption: string | null
  activity_context: string | null
  visibility: string
  likes_count: number
  comments_count: number
  created_at: string
  profile?: Profile
}

export interface PostItemTag {
  id: string
  post_id: string
  wardrobe_item_id: string | null
  item_name: string | null
  source_url: string | null
  x_pos: number | null
  y_pos: number | null
}
