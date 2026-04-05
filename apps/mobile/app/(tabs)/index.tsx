import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Bell } from 'lucide-react-native'
import { useAuthStore } from '@/stores/authStore'
import { useWeather } from '@/hooks/useWeather'
import { useOutfit } from '@/hooks/useOutfit'
import { WeatherBadge } from '@/components/outfit/WeatherBadge'
import { ActivitySelector } from '@/components/outfit/ActivitySelector'
import { OutfitCard } from '@/components/outfit/OutfitCard'

export default function HomeScreen() {
  const { profile } = useAuthStore()
  const [activity, setActivity] = useState('Casual')
  const [refreshing, setRefreshing] = useState(false)

  const { data: weather, isLoading: loadingWeather, refetch: refetchWeather } = useWeather()
  const {
    outfit,
    outfitItems,
    loadingCached,
    generating,
    generate,
    acceptOutfit,
  } = useOutfit(weather, activity)

  // Auto-generate if no outfit today
  useEffect(() => {
    if (!loadingCached && !outfit && weather && !generating) {
      generate()
    }
  }, [loadingCached, outfit, weather])

  async function onRefresh() {
    setRefreshing(true)
    await refetchWeather()
    setRefreshing(false)
  }

  function handleRegenerate() {
    generate()
  }

  function handleAccept() {
    if (outfit) acceptOutfit(outfit.id)
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
          <View>
            <Text className="font-sans text-text-secondary text-sm">
              {greeting()}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
            </Text>
            <Text className="font-serif text-2xl text-text-primary">Today's outfit</Text>
          </View>
          <View className="flex-row items-center gap-3">
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-9 h-9 rounded-pill"
                contentFit="cover"
              />
            ) : (
              <View className="w-9 h-9 rounded-pill bg-surface-raised" />
            )}
          </View>
        </View>

        <View className="px-5">
          {/* Weather */}
          {weather && (
            <View className="mb-4">
              <WeatherBadge weather={weather} />
              <Text className="font-sans text-xs text-text-muted mt-1">
                {weather.high}° high · {weather.low}° low
                {profile?.location_city ? ` · ${profile.location_city}` : ''}
              </Text>
            </View>
          )}

          {!weather && !loadingWeather && (
            <View className="bg-accent-soft rounded-card px-4 py-3 mb-4">
              <Text className="font-sans text-sm text-text-secondary">
                Add your location in settings for weather-based outfit suggestions
              </Text>
            </View>
          )}

          {/* Activity selector */}
          <View className="mb-5">
            <ActivitySelector selected={activity} onSelect={(a) => { setActivity(a); generate() }} />
          </View>

          {/* Outfit card */}
          <OutfitCard
            outfit={outfit ?? null}
            items={outfitItems}
            generating={generating || loadingCached}
            onAccept={handleAccept}
            onRegenerate={handleRegenerate}
          />

          {/* Date */}
          <Text className="font-sans text-text-muted text-xs text-center mt-6 mb-4">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
