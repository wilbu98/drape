import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { WardrobeItem } from '@/types'

export function useWardrobe() {
  const { session } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: items = [], isLoading } = useQuery<WardrobeItem[]>({
    queryKey: ['wardrobe', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!session,
  })

  const { mutateAsync: addItem, isPending: adding } = useMutation({
    mutationFn: async (item: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at' | 'times_worn' | 'last_worn_at'>) => {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .insert({ ...item, user_id: session!.user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wardrobe'] }),
  })

  const { mutateAsync: updateItem } = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WardrobeItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wardrobe'] }),
  })

  const { mutateAsync: deleteItem } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wardrobe'] }),
  })

  return { items, isLoading, addItem, adding, updateItem, deleteItem }
}
