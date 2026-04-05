import { View, Text, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { RefreshCw } from 'lucide-react-native'
import type { WardrobeItem } from '@/types'

interface OutfitItemCardProps {
  item: WardrobeItem
  onSwap?: () => void
}

export function OutfitItemCard({ item, onSwap }: OutfitItemCardProps) {
  return (
    <View className="bg-surface border border-border rounded-card overflow-hidden">
      {item.photo_url ? (
        <Image
          source={{ uri: item.photo_url }}
          className="w-full aspect-square"
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="w-full aspect-square bg-surface-raised items-center justify-center">
          <Text className="font-sans text-text-muted text-xs text-center px-2">{item.category}</Text>
        </View>
      )}
      <View className="p-2">
        <Text className="font-sans text-xs text-text-primary" numberOfLines={1}>{item.name}</Text>
        {item.brand && (
          <Text className="font-mono text-xs text-text-muted" numberOfLines={1}>{item.brand}</Text>
        )}
      </View>
      {onSwap && (
        <TouchableOpacity
          onPress={onSwap}
          className="absolute top-2 right-2 w-7 h-7 bg-surface rounded-pill items-center justify-center shadow-card"
        >
          <RefreshCw size={13} color="#6B6B6B" />
        </TouchableOpacity>
      )}
    </View>
  )
}
