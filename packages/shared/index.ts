// Shared types and utilities used by both mobile and web apps

export const ACTIVITY_TYPES = [
  'Casual',
  'Work',
  'Gym / Athletic',
  'Going Out',
  'Date Night',
  'Travel',
  'Formal',
] as const

export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export const CLOTHING_CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Activewear',
] as const

export type ClothingCategory = (typeof CLOTHING_CATEGORIES)[number]

export const STYLE_TAGS = [
  'Minimal',
  'Streetwear',
  'Classic',
  'Boho',
  'Preppy',
  'Athleisure',
  'Maximalist',
  'Vintage',
  'Edgy',
  'Romantic',
] as const

export type StyleTag = (typeof STYLE_TAGS)[number]
