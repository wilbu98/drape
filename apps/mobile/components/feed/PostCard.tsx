import { useState } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Heart, Bookmark, MessageCircle, MoreHorizontal } from 'lucide-react-native'
import { usePostLikes } from '@/hooks/usePostLikes'
import type { OutfitPost } from '@/types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface PostCardProps {
  post: OutfitPost & { profile: any }
  onLike: () => void
  onSave: () => void
}

export function PostCard({ post, onLike, onSave }: PostCardProps) {
  const router = useRouter()
  const { liked, saved } = usePostLikes(post.id)
  const [likesCount, setLikesCount] = useState(post.likes_count)

  function handleLike() {
    setLikesCount((prev) => liked ? prev - 1 : prev + 1)
    onLike()
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  return (
    <View className="mb-6">
      {/* User row */}
      <TouchableOpacity
        onPress={() => router.push(`/profile/${post.profile.username}`)}
        className="flex-row items-center px-4 mb-3"
      >
        {post.profile.avatar_url ? (
          <Image
            source={{ uri: post.profile.avatar_url }}
            className="w-9 h-9 rounded-pill mr-3"
            contentFit="cover"
          />
        ) : (
          <View className="w-9 h-9 rounded-pill bg-surface-raised mr-3" />
        )}
        <View className="flex-1">
          <Text className="font-sans-bold text-text-primary text-sm">
            {post.profile.username}
          </Text>
          {post.activity_context && (
            <Text className="font-sans text-xs text-text-muted">{post.activity_context}</Text>
          )}
        </View>
        <Text className="font-sans text-xs text-text-muted mr-2">{timeAgo(post.created_at)}</Text>
        <TouchableOpacity>
          <MoreHorizontal size={18} color="#AAAAAA" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Photo */}
      <TouchableOpacity
        activeOpacity={0.97}
        onPress={() => router.push(`/post/${post.id}`)}
      >
        <Image
          source={{ uri: post.photo_url }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.25 }}
          contentFit="cover"
          transition={200}
        />
      </TouchableOpacity>

      {/* Actions */}
      <View className="flex-row items-center px-4 pt-3 pb-1">
        <TouchableOpacity onPress={handleLike} className="mr-4 flex-row items-center gap-1.5">
          <Heart
            size={22}
            color={liked ? '#E0443A' : '#111111'}
            fill={liked ? '#E0443A' : 'transparent'}
          />
          {likesCount > 0 && (
            <Text className="font-sans text-sm text-text-secondary">{likesCount}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/post/${post.id}`)}
          className="mr-4 flex-row items-center gap-1.5"
        >
          <MessageCircle size={22} color="#111111" />
          {post.comments_count > 0 && (
            <Text className="font-sans text-sm text-text-secondary">{post.comments_count}</Text>
          )}
        </TouchableOpacity>

        <View className="flex-1" />

        <TouchableOpacity onPress={onSave}>
          <Bookmark
            size={22}
            color={saved ? '#111111' : '#111111'}
            fill={saved ? '#111111' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {post.caption && (
        <View className="px-4 pb-1">
          <Text className="font-sans text-sm text-text-primary">
            <Text className="font-sans-bold">{post.profile.username} </Text>
            {post.caption}
          </Text>
        </View>
      )}

      {/* Comments link */}
      {post.comments_count > 0 && (
        <TouchableOpacity
          onPress={() => router.push(`/post/${post.id}`)}
          className="px-4 pb-1"
        >
          <Text className="font-sans text-sm text-text-muted">
            View {post.comments_count === 1 ? '1 comment' : `all ${post.comments_count} comments`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
