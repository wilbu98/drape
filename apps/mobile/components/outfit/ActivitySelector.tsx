import { ScrollView, TouchableOpacity, Text, View } from 'react-native'
import { ACTIVITY_TYPES } from '@drape/shared'

interface ActivitySelectorProps {
  selected: string
  onSelect: (activity: string) => void
}

export function ActivitySelector({ selected, onSelect }: ActivitySelectorProps) {
  return (
    <View>
      <Text className="font-sans text-sm text-text-secondary mb-2">Today I'm dressing for</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {ACTIVITY_TYPES.map((activity) => (
            <TouchableOpacity
              key={activity}
              onPress={() => onSelect(activity)}
              className={`px-4 h-8 rounded-pill border items-center justify-center ${
                selected === activity
                  ? 'bg-accent border-accent'
                  : 'bg-surface border-border'
              }`}
            >
              <Text className={`font-sans text-sm ${selected === activity ? 'text-white' : 'text-text-primary'}`}>
                {activity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
