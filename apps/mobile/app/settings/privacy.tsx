import { useState } from 'react'
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export default function PrivacyScreen() {
  const router = useRouter()
  const { profile, session, setProfile } = useAuthStore()
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true)
  const [saving, setSaving] = useState(false)

  async function handleTogglePublic(value: boolean) {
    setIsPublic(value)
    setSaving(true)
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_public: value })
      .eq('id', session!.user.id)
      .select()
      .single()
    setSaving(false)
    if (error) {
      setIsPublic(!value)
      Alert.alert('Error', error.message)
    } else {
      setProfile(data)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-5 pt-4 pb-5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={22} color="#111111" />
        </TouchableOpacity>
        <Text className="font-serif text-2xl text-text-primary">Privacy</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="font-sans text-xs text-text-muted uppercase tracking-widest px-5 py-2">
          Account
        </Text>

        <View className="flex-row items-center px-5 py-4 border-b border-border bg-surface">
          <View className="flex-1 mr-4">
            <Text className="font-sans text-text-primary">Public profile</Text>
            <Text className="font-sans text-xs text-text-muted mt-0.5">
              {isPublic
                ? 'Anyone can see your profile and posts'
                : 'Only approved followers can see your posts'}
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={handleTogglePublic}
            disabled={saving}
            trackColor={{ false: '#E8E8E8', true: '#1A1A1A' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text className="font-sans text-text-muted text-xs px-5 py-3">
          When your account is private, only people you approve can follow you and see your posts.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
