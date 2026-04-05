import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Dimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import type { OutfitPost } from '@/types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TILE_SIZE = (SCREEN_WIDTH - 4) / 3

export default function ExploreScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['explore'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('outfit_posts')
        .select('id, photo_url, likes_count, comments_count')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range(pageParam * 30, (pageParam + 1) * 30 - 1)
      if (error) throw error
      return data
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 30 ? allPages.length : undefined,
    initialPageParam: 0,
  })

  const posts = data?.pages.flat() ?? []

  async function handleSearch(text: string) {
    setSearch(text)
    if (!text.trim()) { setSearchResults([]); return }
    setSearchLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .ilike('username', `%${text.trim()}%`)
      .limit(20)
    setSearchResults(data ?? [])
    setSearchLoading(false)
  }

  function renderPost({ item, index }: { item: any; index: number }) {
    const col = index % 3
    const margin = col === 0 ? { marginRight: 2 } : col === 1 ? { marginHorizontal: 1 } : { marginLeft: 2 }
    return (
      <TouchableOpacity
        onPress={() => router.push(`/post/${item.id}`)}
        style={{ width: TILE_SIZE, height: TILE_SIZE, marginBottom: 2, ...margin }}
      >
        <Image
          source={{ uri: item.photo_url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </TouchableOpacity>
    )
  }

  function renderUser({ item }: { item: any }) {
    return (
      <TouchableOpacity
        onPress={() => { router.push(`/profile/${item.username}`); setSearch(''); setSearchResults([]) }}
        className="flex-row items-center px-5 py-3 border-b border-border"
      >
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} className="w-11 h-11 rounded-pill mr-3" contentFit="cover" />
        ) : (
          <View className="w-11 h-11 rounded-pill bg-surface-raised mr-3" />
        )}
        <View>
          <Text className="font-sans-bold text-text-primary">{item.username}</Text>
          {item.full_name && (
            <Text className="font-sans text-sm text-text-secondary">{item.full_name}</Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Search bar */}
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center bg-surface-raised rounded-btn px-4 h-11 gap-3">
          <Search size={17} color="#AAAAAA" />
          <TextInput
            className="flex-1 font-sans text-text-primary text-sm"
            placeholder="Search people..."
            placeholderTextColor="#AAAAAA"
            value={search}
            onChangeText={handleSearch}
            onFocus={() => setSearching(true)}
            onBlur={() => !search && setSearching(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setSearchResults([]) }}>
              <X size={16} color="#AAAAAA" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search results */}
      {search.length > 0 ? (
        searchLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#1A1A1A" />
          </View>
        ) : searchResults.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="font-sans text-text-muted">No results for "{search}"</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <>
          {/* Grid header */}
          <View className="px-5 pb-3">
            <Text className="font-serif text-2xl text-text-primary">Explore</Text>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#1A1A1A" />
            </View>
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              onEndReached={() => hasNextPage && fetchNextPage()}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage
                  ? <View className="py-4 items-center"><ActivityIndicator color="#AAAAAA" /></View>
                  : null
              }
              contentContainerStyle={{ paddingBottom: 32 }}
            />
          )}
        </>
      )}
    </SafeAreaView>
  )
}
