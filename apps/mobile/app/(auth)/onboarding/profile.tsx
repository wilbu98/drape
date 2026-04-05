import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Camera } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export default function OnboardingProfile() {
  const router = useRouter()
  const { session } = useAuthStore()
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled) setAvatarUri(result.assets[0].uri)
  }

  async function handleContinue() {
    if (!username.trim()) {
      Alert.alert('Username required', 'Please choose a username.')
      return
    }
    if (username.length < 3) {
      Alert.alert('Too short', 'Username must be at least 3 characters.')
      return
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      Alert.alert('Invalid username', 'Use only lowercase letters, numbers, and underscores.')
      return
    }

    setLoading(true)

    let avatarUrl: string | null = null

    if (avatarUri && session) {
      const ext = avatarUri.split('.').pop()
      const path = `${session.user.id}/avatar.${ext}`
      const formData = new FormData()
      formData.append('file', { uri: avatarUri, name: `avatar.${ext}`, type: `image/${ext}` } as any)

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, formData, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
    }

    const { error } = await supabase.from('profiles').upsert({
      id: session?.user.id,
      username: username.trim().toLowerCase(),
      full_name: fullName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl,
    })

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        Alert.alert('Username taken', 'Please choose a different username.')
      } else {
        Alert.alert('Error', error.message)
      }
    } else {
      router.push('/(auth)/onboarding/location')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-10 pb-8">
          {/* Progress */}
          <View className="flex-row gap-1 mb-10">
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                className={`flex-1 h-1 rounded-pill ${step === 1 ? 'bg-accent' : 'bg-border'}`}
              />
            ))}
          </View>

          <Text className="font-serif text-3xl text-text-primary mb-2">Your profile</Text>
          <Text className="font-sans text-text-secondary mb-8">
            Tell us a little about yourself
          </Text>

          {/* Avatar */}
          <TouchableOpacity onPress={pickAvatar} className="items-center mb-8">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-24 h-24 rounded-pill bg-surface-raised"
              />
            ) : (
              <View className="w-24 h-24 rounded-pill bg-surface-raised items-center justify-center">
                <Camera size={28} color="#AAAAAA" />
              </View>
            )}
            <Text className="font-sans text-text-secondary text-sm mt-2">Add photo</Text>
          </TouchableOpacity>

          {/* Fields */}
          <View className="gap-4 mb-8">
            <View>
              <Text className="font-sans text-sm text-text-secondary mb-2">
                Username <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                placeholder="yourname"
                placeholderTextColor="#AAAAAA"
                value={username}
                onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
              />
            </View>

            <View>
              <Text className="font-sans text-sm text-text-secondary mb-2">Full name</Text>
              <TextInput
                className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                placeholder="Your name"
                placeholderTextColor="#AAAAAA"
                value={fullName}
                onChangeText={setFullName}
                maxLength={50}
              />
            </View>

            <View>
              <Text className="font-sans text-sm text-text-secondary mb-2">Bio</Text>
              <TextInput
                className="bg-surface border border-border rounded-btn px-4 py-3 font-sans text-text-primary"
                placeholder="Tell us about your style..."
                placeholderTextColor="#AAAAAA"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                maxLength={150}
                style={{ height: 80, textAlignVertical: 'top' }}
              />
              <Text className="font-sans text-text-muted text-xs text-right mt-1">
                {bio.length}/150
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-accent rounded-btn h-12 items-center justify-center"
            onPress={handleContinue}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text className="font-sans-bold text-white text-base">Continue</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
