// Gemini is called server-side only via Supabase Edge Functions.
// This file is a typed client for calling those functions from mobile.
import { supabase } from './supabase'
import type { WardrobeItem } from '@/types'

export interface OutfitResult {
  outfit: {
    top: string | null
    bottom: string | null
    shoes: string | null
    outerwear: string | null
    accessory: string | null
  }
  reasoning: string
}

export async function generateOutfit(
  wardrobeItems: WardrobeItem[],
  weatherTemp: number,
  weatherCondition: string,
  precipitationChance: number,
  activityType: string
): Promise<OutfitResult> {
  const { data, error } = await supabase.functions.invoke('generate-outfit', {
    body: {
      wardrobe: wardrobeItems,
      weather: { temp: weatherTemp, condition: weatherCondition, precipitation_chance: precipitationChance },
      activity: activityType,
    },
  })
  if (error) throw error
  return data as OutfitResult
}
