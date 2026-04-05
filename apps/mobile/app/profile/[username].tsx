import { View, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useAuthStore } from '@/stores/authStore'
import { useProfile } from '@/hooks/useProfile'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import type { OutfitPost } from '@/types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TILE_SIZE = (SCREEN_WIDTH - 4) / 3

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const router = useRouter()
  const { session } = useAuthStore()
  const {
    profile,
    posts,
    followerCount,
    followingCount,
    isFollowing,
    isLoading,
    toggleFollow,
    togglingFollow,
  } = useProfile(username)

  function renderPost({ item, index }: { item: OutfitPost; index: number }) {
    const col = index % 3
    const margin = col === 0 ? { marginRight: 2 } : col === 1 ? { marginHorizontal: 1 } : { marginLeft: 2 }
    return (
      <TouchableOpacity
        onPress={() => router.push(`/post/${item.id}`)}
        style={{ width: TILE_SIZE, height: TILE_SIZE, marginBottom: 2, ...margin }}
      >
        <Image source={{ uri: item.photo_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      </TouchableOpacity>
    )
  }

  if (isLoading || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#1A1A1A" />
      </SafeAreaView>
    )
  }

  const isOwnProfile = session?.user.id === profile.id

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View className="flex-row items-center px-5 pt-4 pb-2">
              <TouchableOpacity onPress={() => router.back()} className="mr-4">
                <ArrowLeft size={22} color="#111111" />
              </TouchableOpacity>
            </View>
            <ProfileHeader
              profile={profile}
              postCount={posts.length}
              followerCount={followerCount}
              followingCount={followingCount}
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              togglingFollow={togglingFollow}
              onFollow={toggleFollow}
            />
            <View className="border-t border-border mb-0.5" />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  )
}
