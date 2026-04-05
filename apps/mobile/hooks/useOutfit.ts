import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { generateOutfit } from '@/lib/gemini'
import { useAuthStore } from '@/stores/authStore'
import type { WardrobeItem, GeneratedOutfit } from '@/types'
import type { WeatherData } from '@/lib/weather'

export function useOutfit(weather: WeatherData | undefined, activityType: string) {
  const { session, profile } = useAuthStore()
  const queryClient = useQueryClient()

  const today = new Date().toISOString().split('T')[0]

  // Fetch wardrobe
  const { data: wardrobe = [] } = useQuery<WardrobeItem[]>({
    queryKey: ['wardrobe', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!session,
  })

  // Fetch today's generated outfit (cached)
  const { data: cachedOutfit, isLoading: loadingCached } = useQuery<GeneratedOutfit | null>({
    queryKey: ['outfit', 'today', session?.user.id, today],
    queryFn: async () => {
      const { data } = await supabase
        .from('generated_outfits')
        .select('*')
        .eq('user_id', session!.user.id)
        .gte('generated_at', `${today}T00:00:00`)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return data
    },
    enabled: !!session,
  })

  // Generate new outfit
  const { mutate: generate, isPending: generating } = useMutation({
    mutationFn: async () => {
      if (!weather || wardrobe.length === 0) throw new Error('Missing weather or wardrobe data')
      const result = await generateOutfit(
        wardrobe,
        weather.temp,
        weather.condition,
        weather.precipitation_chance,
        activityType,
      )
      const itemIds = Object.values(result.outfit).filter(Boolean) as string[]
      const { data, error } = await supabase
        .from('generated_outfits')
        .insert({
          user_id: session!.user.id,
          item_ids: itemIds,
          weather_temp: weather.temp,
          weather_condition: weather.condition,
          activity_type: activityType,
        })
        .select()
        .single()
      if (error) throw error
      return data as GeneratedOutfit
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfit', 'today'] })
    },
  })

  // Accept outfit
  const { mutate: acceptOutfit } = useMutation({
    mutationFn: async (outfitId: string) => {
      await supabase
        .from('generated_outfits')
        .update({ accepted: true })
        .eq('id', outfitId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfit', 'today'] })
    },
  })

  const outfitItems: WardrobeItem[] = cachedOutfit
    ? wardrobe.filter((item) => cachedOutfit.item_ids.includes(item.id))
    : []

  return {
    wardrobe,
    outfit: cachedOutfit,
    outfitItems,
    loadingCached,
    generating,
    generate,
    acceptOutfit,
  }
}
