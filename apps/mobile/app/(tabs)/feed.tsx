import { useCallback } from 'react'
import {
  View, Text, FlatList, ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useFeed } from '@/hooks/useFeed'
import { PostCard } from '@/components/feed/PostCard'
import { useAuthStore } from '@/stores/authStore'
import { PostCardSkeleton } from '@/components/ui/Skeleton'
import { ErrorView } from '@/components/ui/ErrorView'
import type { OutfitPost } from '@/types'

export default function FeedScreen() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const {
    posts,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    toggleLike,
    toggleSave,
  } = useFeed()

  const renderPost = useCallback(({ item }: { item: OutfitPost & { profile: any } }) => (
    <PostCard
      post={item}
      onLike={() => toggleLike({ postId: item.id, liked: false })}
      onSave={() => toggleSave({ postId: item.id, saved: false })}
    />
  ), [toggleLike, toggleSave])

  const renderFooter = () => {
    if (!isFetchingNextPage) return null
    return (
      <View className="py-6 items-center">
        <ActivityIndicator color="#AAAAAA" />
      </View>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <Text className="font-serif text-2xl text-text-primary">Feed</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8 }}>
          {[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <Text className="font-serif text-2xl text-text-primary">Feed</Text>
        </View>
        <ErrorView message="Couldn't load your feed" onRetry={refetch} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-border">
        <Text className="font-serif text-2xl text-text-primary">Feed</Text>
      </View>

      {posts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="font-serif text-xl text-text-primary mb-2 text-center">
            Nothing here yet
          </Text>
          <Text className="font-sans text-text-secondary text-center mb-6">
            Follow people to see their outfits, or share your own look
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/explore')}
            className="bg-accent rounded-btn px-6 h-11 items-center justify-center"
          >
            <Text className="font-sans-bold text-white">Discover people</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} />
          }
          contentContainerStyle={{ paddingTop: 8 }}
        />
      )}
    </SafeAreaView>
  )
}
