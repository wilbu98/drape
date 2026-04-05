import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function usePostLikes(postId: string) {
  const { session } = useAuthStore()

  const { data: liked = false } = useQuery({
    queryKey: ['like', postId, session?.user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', session!.user.id)
        .eq('post_id', postId)
        .maybeSingle()
      return !!data
    },
    enabled: !!session,
  })

  const { data: saved = false } = useQuery({
    queryKey: ['save', postId, session?.user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', session!.user.id)
        .eq('post_id', postId)
        .maybeSingle()
      return !!data
    },
    enabled: !!session,
  })

  return { liked, saved }
}
