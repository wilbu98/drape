import { View, Text, TouchableOpacity } from 'react-native'

interface EmptyStateProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({ title, subtitle, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-10 py-16">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="font-serif text-xl text-text-primary text-center mb-2">{title}</Text>
      {subtitle && (
        <Text className="font-sans text-text-secondary text-center text-sm mb-6">{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="bg-accent rounded-btn px-6 h-11 items-center justify-center"
        >
          <Text className="font-sans-bold text-white">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
