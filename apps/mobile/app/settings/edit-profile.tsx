import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { ArrowLeft, Camera } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export default function EditProfileScreen() {
  const router = useRouter()
  const { profile, session, setProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [avatarUri, setAvatarUri] = useState<string | null>(null)

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [username, setUsername] = useState(profile?.username ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [locationCity, setLocationCity] = useState(profile?.location_city ?? '')

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled) setAvatarUri(result.assets[0].uri)
  }

  async function handleSave() {
    if (!username.trim()) {
      Alert.alert('Username required')
      return
    }
    setLoading(true)

    let avatarUrl = profile?.avatar_url ?? null

    if (avatarUri && session) {
      const ext = avatarUri.split('.').pop() ?? 'jpg'
      const path = `${session.user.id}/avatar.${ext}`
      const formData = new FormData()
      formData.append('file', { uri: avatarUri, name: `avatar.${ext}`, type: `image/${ext}` } as any)
      const { error } = await supabase.storage.from('avatars').upload(path, formData, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
    }

    const updates = {
      id: session!.user.id,
      username: username.trim().toLowerCase(),
      full_name: fullName.trim() || null,
      bio: bio.trim() || null,
      location_city: locationCity.trim() || null,
      avatar_url: avatarUrl,
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session!.user.id)
      .select()
      .single()

    setLoading(false)

    if (error) {
      if (error.code === '23505') Alert.alert('Username taken', 'Choose a different username.')
      else Alert.alert('Error', error.message)
    } else {
      setProfile(data)
      router.back()
    }
  }

  const displayAvatar = avatarUri ?? profile?.avatar_url

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={22} color="#111111" />
          </TouchableOpacity>
          <Text className="font-serif text-xl text-text-primary">Edit profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#1A1A1A" />
              : <Text className="font-sans-bold text-text-primary">Save</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <TouchableOpacity onPress={pickAvatar} className="items-center mb-8">
          {displayAvatar ? (
            <Image source={{ uri: displayAvatar }} className="w-24 h-24 rounded-pill" />
          ) : (
            <View className="w-24 h-24 rounded-pill bg-surface-raised items-center justify-center">
              <Camera size={28} color="#AAAAAA" />
            </View>
          )}
          <Text className="font-sans text-text-secondary text-sm mt-2">Change photo</Text>
        </TouchableOpacity>

        {/* Fields */}
        <View className="px-5 gap-4">
          <View>
            <Text className="font-sans text-sm text-text-secondary mb-2">Full name</Text>
            <TextInput
              className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor="#AAAAAA"
            />
          </View>

          <View>
            <Text className="font-sans text-sm text-text-secondary mb-2">Username</Text>
            <TextInput
              className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text className="font-sans text-sm text-text-secondary mb-2">Bio</Text>
            <TextInput
              className="bg-surface border border-border rounded-btn px-4 py-3 font-sans text-text-primary"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              maxLength={150}
              placeholder="Tell us about your style..."
              placeholderTextColor="#AAAAAA"
              style={{ height: 80, textAlignVertical: 'top' }}
            />
          </View>

          <View>
            <Text className="font-sans text-sm text-text-secondary mb-2">City</Text>
            <TextInput
              className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
              value={locationCity}
              onChangeText={setLocationCity}
              placeholder="New York, London..."
              placeholderTextColor="#AAAAAA"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
