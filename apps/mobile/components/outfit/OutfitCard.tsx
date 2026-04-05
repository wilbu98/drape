import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Check, RefreshCw, Shuffle } from 'lucide-react-native'
import { OutfitItemCard } from './OutfitItemCard'
import type { WardrobeItem, GeneratedOutfit } from '@/types'

interface OutfitCardProps {
  outfit: GeneratedOutfit | null
  items: WardrobeItem[]
  generating: boolean
  onAccept: () => void
  onRegenerate: () => void
}

export function OutfitCard({ outfit, items, generating, onAccept, onRegenerate }: OutfitCardProps) {
  if (generating) {
    return (
      <View className="bg-surface border border-border rounded-card p-8 items-center justify-center min-h-64">
        <ActivityIndicator color="#1A1A1A" size="large" />
        <Text className="font-sans text-text-secondary mt-4">Styling your outfit...</Text>
      </View>
    )
  }

  if (!outfit || items.length === 0) {
    return (
      <View className="bg-surface border border-border rounded-card p-8 items-center justify-center min-h-64">
        <Text className="font-serif text-xl text-text-primary mb-2">No outfit yet</Text>
        <Text className="font-sans text-text-secondary text-center mb-6">
          Add some clothes to your wardrobe and we'll style you every morning
        </Text>
        <TouchableOpacity
          className="bg-accent rounded-btn px-6 h-10 items-center justify-center"
          onPress={onRegenerate}
        >
          <Text className="font-sans-bold text-white">Generate outfit</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View>
      {/* Item grid */}
      <View className="flex-row flex-wrap gap-3 mb-4">
        {items.map((item) => (
          <View key={item.id} className="w-[48%]">
            <OutfitItemCard item={item} />
          </View>
        ))}
      </View>

      {/* Reasoning */}
      {outfit.activity_type && (
        <View className="bg-accent-soft rounded-card px-4 py-3 mb-5">
          <Text className="font-sans text-sm text-text-secondary italic">
            Styled for {outfit.activity_type} · {outfit.weather_temp}° {outfit.weather_condition}
          </Text>
        </View>
      )}

      {/* Actions */}
      {!outfit.accepted ? (
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center border border-border rounded-btn h-12 gap-2"
            onPress={onRegenerate}
          >
            <RefreshCw size={16} color="#6B6B6B" />
            <Text className="font-sans text-text-secondary">Regenerate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-accent rounded-btn h-12 gap-2"
            onPress={onAccept}
          >
            <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="font-sans-bold text-white">Wear this</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Check size={16} color="#2D9B6F" strokeWidth={2.5} />
            <Text className="font-sans text-success">Outfit accepted</Text>
          </View>
          <TouchableOpacity onPress={onRegenerate} className="flex-row items-center gap-1">
            <Shuffle size={14} color="#AAAAAA" />
            <Text className="font-sans text-text-muted text-sm">Change</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
