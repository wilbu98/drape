import { useState } from 'react'
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'

interface NotifRowProps {
  label: string
  description: string
  value: boolean
  onToggle: (v: boolean) => void
}

function NotifRow({ label, description, value, onToggle }: NotifRowProps) {
  return (
    <View className="flex-row items-center px-5 py-4 border-b border-border bg-surface">
      <View className="flex-1 mr-4">
        <Text className="font-sans text-text-primary">{label}</Text>
        <Text className="font-sans text-xs text-text-muted mt-0.5">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E8E8E8', true: '#1A1A1A' }}
        thumbColor="#FFFFFF"
      />
    </View>
  )
}

export default function NotificationsScreen() {
  const router = useRouter()
  const [morningOutfit, setMorningOutfit] = useState(true)
  const [newFollower, setNewFollower] = useState(true)
  const [likes, setLikes] = useState(true)
  const [comments, setComments] = useState(true)
  const [friendPosted, setFriendPosted] = useState(false)

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-5 pt-4 pb-5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={22} color="#111111" />
        </TouchableOpacity>
        <Text className="font-serif text-2xl text-text-primary">Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="font-sans text-xs text-text-muted uppercase tracking-widest px-5 py-2">
          Daily
        </Text>
        <NotifRow
          label="Morning outfit"
          description="Get notified when today's outfit is ready"
          value={morningOutfit}
          onToggle={setMorningOutfit}
        />

        <Text className="font-sans text-xs text-text-muted uppercase tracking-widest px-5 py-2 mt-4">
          Social
        </Text>
        <NotifRow
          label="New followers"
          description="When someone follows you"
          value={newFollower}
          onToggle={setNewFollower}
        />
        <NotifRow
          label="Likes"
          description="When someone likes your post"
          value={likes}
          onToggle={setLikes}
        />
        <NotifRow
          label="Comments"
          description="When someone comments on your post"
          value={comments}
          onToggle={setComments}
        />
        <NotifRow
          label="Friends posted"
          description="When someone you follow shares a look"
          value={friendPosted}
          onToggle={setFriendPosted}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
