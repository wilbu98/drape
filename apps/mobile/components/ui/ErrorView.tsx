import { View, Text, TouchableOpacity } from 'react-native'
import { AlertCircle, RefreshCw } from 'lucide-react-native'

interface ErrorViewProps {
  message?: string
  onRetry?: () => void
}

export function ErrorView({ message = 'Something went wrong', onRetry }: ErrorViewProps) {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <AlertCircle size={36} color="#E0443A" />
      <Text className="font-sans text-text-secondary text-center mt-3 mb-5">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="flex-row items-center gap-2 border border-border rounded-btn px-5 h-10"
        >
          <RefreshCw size={15} color="#6B6B6B" />
          <Text className="font-sans text-text-secondary">Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
