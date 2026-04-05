import { useState, useMemo } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Plus, Search } from 'lucide-react-native'
import { useWardrobe } from '@/hooks/useWardrobe'
import { CategoryFilter } from '@/components/wardrobe/CategoryFilter'
import { WardrobeItemTile } from '@/components/wardrobe/WardrobeItemTile'
import type { WardrobeItem } from '@/types'

export default function WardrobeScreen() {
  const router = useRouter()
  const { items, isLoading } = useWardrobe()
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categoryCounts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1
      return acc
    }, {})
  }, [items])

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return items
    return items.filter((item) => item.category === selectedCategory)
  }, [items, selectedCategory])

  function renderItem({ item, index }: { item: WardrobeItem; index: number }) {
    return (
      <View className={`flex-1 ${index % 2 === 0 ? 'mr-1.5' : 'ml-1.5'} mb-3`}>
        <WardrobeItemTile
          item={item}
          onPress={() => router.push(`/wardrobe/${item.id}`)}
        />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <Text className="font-serif text-2xl text-text-primary">Wardrobe</Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="w-9 h-9 items-center justify-center">
            <Search size={20} color="#6B6B6B" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/wardrobe/add')}
            className="flex-row items-center bg-accent rounded-pill px-4 h-9 gap-1"
          >
            <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="font-sans text-white text-sm">Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary */}
      <Text className="font-sans text-text-muted text-sm px-5 mb-3">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </Text>

      {/* Category filter */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        counts={categoryCounts}
      />

      {/* Grid */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1A1A1A" />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="font-serif text-xl text-text-primary mb-2 text-center">
            {selectedCategory === 'All' ? 'Your wardrobe is empty' : `No ${selectedCategory} yet`}
          </Text>
          <Text className="font-sans text-text-secondary text-center mb-6">
            Add your first item to get started with outfit generation
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/wardrobe/add')}
            className="bg-accent rounded-btn px-6 h-11 items-center justify-center"
          >
            <Text className="font-sans-bold text-white">Add item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}
