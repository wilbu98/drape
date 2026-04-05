import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { OutfitPost } from '@/types'

async function triggerNotification(type: string, userId: string, data?: Record<string, string>) {
  try {
    await supabase.functions.invoke('send-notification', { body: { type, userId, data } })
  } catch {
    // Non-critical — don't throw
  }
}

const PAGE_SIZE = 12

export function useFeed() {
  const { session } = useAuthStore()
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed', session?.user.id],
    queryFn: async ({ pageParam = 0 }) => {
      // Get IDs of people the user follows + own posts
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', session!.user.id)

      const followingIds = [
        session!.user.id,
        ...(follows?.map((f) => f.following_id) ?? []),
      ]

      const { data, error } = await supabase
        .from('outfit_posts')
        .select('*, profile:profiles(id, username, full_name, avatar_url)')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)

      if (error) throw error
      return data as (OutfitPost & { profile: any })[]
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!session,
  })

  const posts = data?.pages.flat() ?? []

  // Like / unlike
  const { mutate: toggleLike } = useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      if (liked) {
        await supabase.from('post_likes').delete()
          .eq('user_id', session!.user.id)
          .eq('post_id', postId)
      } else {
        await supabase.from('post_likes').insert({
          user_id: session!.user.id,
          post_id: postId,
        })
        // Notify post owner
        const { data: post } = await supabase
          .from('outfit_posts')
          .select('user_id')
          .eq('id', postId)
          .single()
        if (post && post.user_id !== session!.user.id) {
          const { data: liker } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session!.user.id)
            .single()
          triggerNotification('new_like', post.user_id, { username: liker?.username ?? '' })
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  })

  // Save / unsave
  const { mutate: toggleSave } = useMutation({
    mutationFn: async ({ postId, saved }: { postId: string; saved: boolean }) => {
      if (saved) {
        await supabase.from('saved_posts').delete()
          .eq('user_id', session!.user.id)
          .eq('post_id', postId)
      } else {
        await supabase.from('saved_posts').insert({
          user_id: session!.user.id,
          post_id: postId,
        })
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  })

  return {
    posts,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    toggleLike,
    toggleSave,
  }
}
