import { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Heart, Bookmark, Send } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { usePostLikes } from '@/hooks/usePostLikes'
import type { OutfitPost } from '@/types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { session } = useAuthStore()
  const queryClient = useQueryClient()
  const inputRef = useRef<TextInput>(null)
  const [comment, setComment] = useState('')
  const { liked, saved } = usePostLikes(id)

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outfit_posts')
        .select('*, profile:profiles(id, username, full_name, avatar_url)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as OutfitPost & { profile: any }
    },
  })

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*, profile:profiles(username, avatar_url)')
        .eq('post_id', id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const { data: tags = [] } = useQuery({
    queryKey: ['tags', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('post_item_tags')
        .select('*')
        .eq('post_id', id)
      return data ?? []
    },
  })

  const { mutate: postComment, isPending: posting } = useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from('post_comments').insert({
        post_id: id,
        user_id: session!.user.id,
        body,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['comments', id] })
      queryClient.invalidateQueries({ queryKey: ['post', id] })
    },
  })

  const { mutate: toggleLike } = useMutation({
    mutationFn: async () => {
      if (liked) {
        await supabase.from('post_likes').delete()
          .eq('user_id', session!.user.id).eq('post_id', id)
      } else {
        await supabase.from('post_likes').insert({ user_id: session!.user.id, post_id: id })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['like', id] })
      queryClient.invalidateQueries({ queryKey: ['post', id] })
    },
  })

  const { mutate: toggleSave } = useMutation({
    mutationFn: async () => {
      if (saved) {
        await supabase.from('saved_posts').delete()
          .eq('user_id', session!.user.id).eq('post_id', id)
      } else {
        await supabase.from('saved_posts').insert({ user_id: session!.user.id, post_id: id })
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['save', id] }),
  })

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (isLoading || !post) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#1A1A1A" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-3 border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={22} color="#111111" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/profile/${post.profile.username}`)}
            className="flex-row items-center flex-1"
          >
            {post.profile.avatar_url ? (
              <Image source={{ uri: post.profile.avatar_url }} className="w-8 h-8 rounded-pill mr-2" contentFit="cover" />
            ) : (
              <View className="w-8 h-8 rounded-pill bg-surface-raised mr-2" />
            )}
            <Text className="font-sans-bold text-text-primary">{post.profile.username}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Photo */}
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: post.photo_url }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.25 }}
              contentFit="cover"
            />
            {/* Item tag dots */}
            {tags.map((tag: any) => (
              <View
                key={tag.id}
                style={{
                  position: 'absolute',
                  left: tag.x_pos * SCREEN_WIDTH - 14,
                  top: tag.y_pos * SCREEN_WIDTH * 1.25 - 14,
                }}
                className="w-7 h-7 bg-white/90 rounded-pill items-center justify-center shadow-card"
              >
                <Text className="font-mono text-xs text-text-primary">·</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View className="flex-row items-center px-4 pt-3 pb-2">
            <TouchableOpacity onPress={() => toggleLike()} className="mr-4 flex-row items-center gap-1.5">
              <Heart size={22} color={liked ? '#E0443A' : '#111111'} fill={liked ? '#E0443A' : 'transparent'} />
              {post.likes_count > 0 && (
                <Text className="font-sans text-sm text-text-secondary">{post.likes_count}</Text>
              )}
            </TouchableOpacity>
            <View className="flex-1" />
            <TouchableOpacity onPress={() => toggleSave()}>
              <Bookmark size={22} color="#111111" fill={saved ? '#111111' : 'transparent'} />
            </TouchableOpacity>
          </View>

          {/* Caption */}
          {post.caption && (
            <View className="px-4 pb-2">
              <Text className="font-sans text-sm text-text-primary">
                <Text className="font-sans-bold">{post.profile.username} </Text>
                {post.caption}
              </Text>
            </View>
          )}

          {/* Item tags list */}
          {tags.length > 0 && (
            <View className="px-4 pb-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {tags.map((tag: any) => (
                    <View key={tag.id} className="bg-surface-raised rounded-pill px-3 py-1.5">
                      <Text className="font-sans text-xs text-text-primary">{tag.item_name}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <Text className="font-sans text-xs text-text-muted px-4 pb-4">
            {timeAgo(post.created_at)}
          </Text>

          {/* Comments */}
          <View className="border-t border-border px-4 pt-4">
            <Text className="font-sans-bold text-text-primary mb-4">Comments</Text>
            {loadingComments ? (
              <ActivityIndicator color="#AAAAAA" />
            ) : comments.length === 0 ? (
              <Text className="font-sans text-text-muted text-sm mb-4">No comments yet — be the first</Text>
            ) : (
              comments.map((c: any) => (
                <View key={c.id} className="flex-row mb-4">
                  {c.profile.avatar_url ? (
                    <Image source={{ uri: c.profile.avatar_url }} className="w-8 h-8 rounded-pill mr-3" contentFit="cover" />
                  ) : (
                    <View className="w-8 h-8 rounded-pill bg-surface-raised mr-3" />
                  )}
                  <View className="flex-1">
                    <Text className="font-sans text-sm text-text-primary">
                      <Text className="font-sans-bold">{c.profile.username} </Text>
                      {c.body}
                    </Text>
                    <Text className="font-sans text-xs text-text-muted mt-0.5">
                      {timeAgo(c.created_at)}
                    </Text>
                  </View>
                </View>
              ))
            )}
            <View className="h-4" />
          </View>
        </ScrollView>

        {/* Comment input */}
        <View className="flex-row items-center px-4 py-3 border-t border-border bg-background gap-3">
          <TextInput
            ref={inputRef}
            className="flex-1 bg-surface-raised rounded-pill px-4 h-10 font-sans text-text-primary text-sm"
            placeholder="Add a comment..."
            placeholderTextColor="#AAAAAA"
            value={comment}
            onChangeText={setComment}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={() => comment.trim() && postComment(comment.trim())}
          />
          <TouchableOpacity
            onPress={() => comment.trim() && postComment(comment.trim())}
            disabled={!comment.trim() || posting}
            className={!comment.trim() ? 'opacity-30' : ''}
          >
            {posting
              ? <ActivityIndicator size="small" color="#1A1A1A" />
              : <Send size={20} color="#1A1A1A" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
