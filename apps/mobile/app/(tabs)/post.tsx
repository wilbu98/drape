import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function PostScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center">
        <Text className="font-serif text-2xl text-text-primary">New Post</Text>
      </View>
    </SafeAreaView>
  )
}
