import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Profile, OutfitPost } from '@/types'

export function useProfile(username: string) {
  const { session } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery<Profile | null>({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      if (error) return null
      return data
    },
    enabled: !!username,
  })

  const { data: posts = [] } = useQuery<OutfitPost[]>({
    queryKey: ['profile-posts', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outfit_posts')
        .select('*')
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!profile?.id,
  })

  const { data: followerCount = 0 } = useQuery<number>({
    queryKey: ['followers', profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile!.id)
      return count ?? 0
    },
    enabled: !!profile?.id,
  })

  const { data: followingCount = 0 } = useQuery<number>({
    queryKey: ['following', profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile!.id)
      return count ?? 0
    },
    enabled: !!profile?.id,
  })

  const { data: isFollowing = false } = useQuery<boolean>({
    queryKey: ['is-following', session?.user.id, profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', session!.user.id)
        .eq('following_id', profile!.id)
        .maybeSingle()
      return !!data
    },
    enabled: !!session && !!profile?.id && session.user.id !== profile?.id,
  })

  const { mutate: toggleFollow, isPending: togglingFollow } = useMutation({
    mutationFn: async () => {
      if (!profile) return
      if (isFollowing) {
        await supabase.from('follows')
          .delete()
          .eq('follower_id', session!.user.id)
          .eq('following_id', profile.id)
      } else {
        await supabase.from('follows').insert({
          follower_id: session!.user.id,
          following_id: profile.id,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following'] })
      queryClient.invalidateQueries({ queryKey: ['followers', profile?.id] })
    },
  })

  return {
    profile,
    posts,
    followerCount,
    followingCount,
    isFollowing,
    isLoading,
    toggleFollow,
    togglingFollow,
  }
}
