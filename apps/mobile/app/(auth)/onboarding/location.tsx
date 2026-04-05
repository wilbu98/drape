import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { MapPin } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export default function OnboardingLocation() {
  const router = useRouter()
  const { session } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [city, setCity] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [detected, setDetected] = useState(false)

  async function detectLocation() {
    setLoading(true)
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      setLoading(false)
      Alert.alert(
        'Permission denied',
        'You can enter your city manually below.',
      )
      return
    }

    const location = await Location.getCurrentPositionAsync({})
    const [geo] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })

    setLat(location.coords.latitude)
    setLng(location.coords.longitude)
    setCity(geo.city || geo.region || '')
    setDetected(true)
    setLoading(false)
  }

  async function handleContinue() {
    setLoading(true)
    const { error } = await supabase.from('profiles').update({
      location_city: city.trim() || null,
      location_lat: lat,
      location_lng: lng,
    }).eq('id', session?.user.id)
    setLoading(false)

    if (error) Alert.alert('Error', error.message)
    else router.push('/(auth)/onboarding/style')
  }

  function handleSkip() {
    router.push('/(auth)/onboarding/style')
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-10 pb-8">
        {/* Progress */}
        <View className="flex-row gap-1 mb-10">
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              className={`flex-1 h-1 rounded-pill ${step <= 2 ? 'bg-accent' : 'bg-border'}`}
            />
          ))}
        </View>

        <Text className="font-serif text-3xl text-text-primary mb-2">Your location</Text>
        <Text className="font-sans text-text-secondary mb-10">
          We use this to get accurate weather for your daily outfit
        </Text>

        {/* Detect Button */}
        <TouchableOpacity
          className="bg-accent-soft border border-border rounded-card p-6 items-center mb-6"
          onPress={detectLocation}
          disabled={loading}
        >
          <MapPin size={32} color="#1A1A1A" />
          <Text className="font-sans-bold text-text-primary text-base mt-3">
            {detected ? city : 'Use my location'}
          </Text>
          {!detected && (
            <Text className="font-sans text-text-secondary text-sm mt-1">
              Tap to detect automatically
            </Text>
          )}
          {loading && <ActivityIndicator color="#1A1A1A" className="mt-2" />}
        </TouchableOpacity>

        {/* Manual Entry */}
        <View className="mb-2">
          <Text className="font-sans text-sm text-text-secondary mb-2">
            Or enter your city manually
          </Text>
          <TextInput
            className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
            placeholder="New York, London, Tokyo..."
            placeholderTextColor="#AAAAAA"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View className="flex-1" />

        <TouchableOpacity
          className="bg-accent rounded-btn h-12 items-center justify-center mb-3"
          onPress={handleContinue}
          disabled={loading || !city.trim()}
        >
          <Text className="font-sans-bold text-white text-base">Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} className="h-12 items-center justify-center">
          <Text className="font-sans text-text-muted text-base">Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
