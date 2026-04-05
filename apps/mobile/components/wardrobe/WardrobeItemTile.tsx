import { TouchableOpacity, View, Text } from 'react-native'
import { Image } from 'expo-image'
import type { WardrobeItem } from '@/types'

interface WardrobeItemTileProps {
  item: WardrobeItem
  onPress: () => void
}

export function WardrobeItemTile({ item, onPress }: WardrobeItemTileProps) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-1">
      <View className="bg-surface border border-border rounded-card overflow-hidden">
        {item.photo_url ? (
          <Image
            source={{ uri: item.photo_url }}
            className="w-full aspect-square"
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="w-full aspect-square bg-surface-raised items-center justify-center">
            <Text className="font-sans text-text-muted text-xs">{item.category}</Text>
          </View>
        )}
        <View className="p-2">
          <Text className="font-sans text-xs text-text-primary" numberOfLines={1}>{item.name}</Text>
          {item.brand ? (
            <Text className="font-mono text-xs text-text-muted" numberOfLines={1}>{item.brand}</Text>
          ) : (
            <Text className="font-sans text-xs text-text-muted" numberOfLines={1}>{item.subcategory ?? item.category}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}
