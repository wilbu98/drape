import { useQuery } from '@tanstack/react-query'
import { getWeather } from '@/lib/weather'
import { useAuthStore } from '@/stores/authStore'

export function useWeather() {
  const { profile } = useAuthStore()

  return useQuery({
    queryKey: ['weather', profile?.location_lat, profile?.location_lng],
    queryFn: () => getWeather(profile!.location_lat!, profile!.location_lng!),
    enabled: !!(profile?.location_lat && profile?.location_lng),
    staleTime: 1000 * 60 * 30, // 30 min
  })
}
