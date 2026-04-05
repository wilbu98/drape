import { ScrollView, TouchableOpacity, Text, View } from 'react-native'
import { CLOTHING_CATEGORIES } from '@drape/shared'

const ALL = 'All'
const FILTERS = [ALL, ...CLOTHING_CATEGORIES]

interface CategoryFilterProps {
  selected: string
  onSelect: (category: string) => void
  counts: Record<string, number>
}

export function CategoryFilter({ selected, onSelect, counts }: CategoryFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
      <View className="flex-row gap-2 px-5">
        {FILTERS.map((cat) => {
          const count = cat === ALL
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : counts[cat] ?? 0
          const active = selected === cat
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelect(cat)}
              className={`flex-row items-center px-4 h-9 rounded-pill border gap-1.5 ${
                active ? 'bg-accent border-accent' : 'bg-surface border-border'
              }`}
            >
              <Text className={`font-sans text-sm ${active ? 'text-white' : 'text-text-primary'}`}>
                {cat}
              </Text>
              {count > 0 && (
                <Text className={`font-mono text-xs ${active ? 'text-white opacity-70' : 'text-text-muted'}`}>
                  {count}
                </Text>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}
