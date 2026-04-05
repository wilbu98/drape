import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import type { Profile } from '@/types'

interface ProfileHeaderProps {
  profile: Profile
  postCount: number
  followerCount: number
  followingCount: number
  isOwnProfile: boolean
  isFollowing?: boolean
  togglingFollow?: boolean
  onFollow?: () => void
  onEdit?: () => void
}

export function ProfileHeader({
  profile,
  postCount,
  followerCount,
  followingCount,
  isOwnProfile,
  isFollowing,
  togglingFollow,
  onFollow,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <View className="px-5 pt-4 pb-5">
      {/* Avatar + stats */}
      <View className="flex-row items-center mb-4">
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            className="w-20 h-20 rounded-pill mr-6"
            contentFit="cover"
          />
        ) : (
          <View className="w-20 h-20 rounded-pill bg-surface-raised mr-6" />
        )}

        <View className="flex-1 flex-row justify-around">
          {[
            { label: 'Posts', value: postCount },
            { label: 'Followers', value: followerCount },
            { label: 'Following', value: followingCount },
          ].map(({ label, value }) => (
            <View key={label} className="items-center">
              <Text className="font-serif text-xl text-text-primary">{value}</Text>
              <Text className="font-sans text-xs text-text-muted">{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Name + bio */}
      {profile.full_name && (
        <Text className="font-sans-bold text-text-primary mb-0.5">{profile.full_name}</Text>
      )}
      <Text className="font-sans text-text-secondary text-sm mb-0.5">@{profile.username}</Text>
      {profile.bio && (
        <Text className="font-sans text-text-primary text-sm mt-1 mb-1">{profile.bio}</Text>
      )}
      {profile.location_city && (
        <Text className="font-sans text-xs text-text-muted mb-3">{profile.location_city}</Text>
      )}

      {/* Action button */}
      {isOwnProfile ? (
        <TouchableOpacity
          onPress={onEdit}
          className="border border-border rounded-btn h-9 items-center justify-center"
        >
          <Text className="font-sans text-sm text-text-primary">Edit profile</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onFollow}
          disabled={togglingFollow}
          className={`rounded-btn h-9 items-center justify-center ${
            isFollowing ? 'border border-border bg-surface' : 'bg-accent'
          }`}
        >
          {togglingFollow ? (
            <ActivityIndicator size="small" color={isFollowing ? '#111111' : '#FFFFFF'} />
          ) : (
            <Text className={`font-sans-bold text-sm ${isFollowing ? 'text-text-primary' : 'text-white'}`}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  )
}
