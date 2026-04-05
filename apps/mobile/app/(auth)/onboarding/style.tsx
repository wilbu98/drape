import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Check } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { STYLE_TAGS, ACTIVITY_TYPES } from '@drape/shared'

export default function OnboardingStyle() {
  const router = useRouter()
  const { session } = useAuthStore()
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggleStyle(tag: string) {
    setSelectedStyles((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function toggleActivity(activity: string) {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    )
  }

  async function handleContinue() {
    if (selectedStyles.length === 0) {
      Alert.alert('Pick your style', 'Select at least one style that speaks to you.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('profiles').update({
      style_preferences: selectedStyles,
      activity_defaults: selectedActivities,
    }).eq('id', session?.user.id)
    setLoading(false)

    if (error) Alert.alert('Error', error.message)
    else router.push('/(auth)/onboarding/wardrobe')
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View className="px-6 pt-10">
          {/* Progress */}
          <View className="flex-row gap-1 mb-10">
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                className={`flex-1 h-1 rounded-pill ${step <= 3 ? 'bg-accent' : 'bg-border'}`}
              />
            ))}
          </View>

          <Text className="font-serif text-3xl text-text-primary mb-2">Your style</Text>
          <Text className="font-sans text-text-secondary mb-8">
            Pick the vibes that fit you — select all that apply
          </Text>

          {/* Style Tags */}
          <Text className="font-sans-bold text-text-primary mb-3">Style</Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {STYLE_TAGS.map((tag) => {
              const selected = selectedStyles.includes(tag)
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleStyle(tag)}
                  className={`flex-row items-center px-4 h-9 rounded-pill border ${
                    selected
                      ? 'bg-accent border-accent'
                      : 'bg-surface border-border'
                  }`}
                >
                  {selected && <Check size={12} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 4 }} />}
                  <Text className={`font-sans text-sm ${selected ? 'text-white' : 'text-text-primary'}`}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Activities */}
          <Text className="font-sans-bold text-text-primary mb-3">
            What do you usually dress for?
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-10">
            {ACTIVITY_TYPES.map((activity) => {
              const selected = selectedActivities.includes(activity)
              return (
                <TouchableOpacity
                  key={activity}
                  onPress={() => toggleActivity(activity)}
                  className={`flex-row items-center px-4 h-9 rounded-pill border ${
                    selected
                      ? 'bg-accent border-accent'
                      : 'bg-surface border-border'
                  }`}
                >
                  {selected && <Check size={12} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 4 }} />}
                  <Text className={`font-sans text-sm ${selected ? 'text-white' : 'text-text-primary'}`}>
                    {activity}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <TouchableOpacity
            className="bg-accent rounded-btn h-12 items-center justify-center"
            onPress={handleContinue}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text className="font-sans-bold text-white text-base">Continue</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
