import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  ArrowLeft, User, Bell, Lock, Moon, LogOut, ChevronRight,
} from 'lucide-react-native'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  onPress?: () => void
  right?: React.ReactNode
  destructive?: boolean
}

function SettingsRow({ icon, label, onPress, right, destructive }: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-5 py-4 border-b border-border bg-surface"
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="w-7 mr-4 items-center">{icon}</View>
      <Text className={`flex-1 font-sans text-base ${destructive ? 'text-error' : 'text-text-primary'}`}>
        {label}
      </Text>
      {right ?? (onPress && <ChevronRight size={16} color="#AAAAAA" />)}
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const router = useRouter()
  const { profile, signOut } = useAuthStore()

  function confirmSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          signOut()
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={22} color="#111111" />
        </TouchableOpacity>
        <Text className="font-serif text-2xl text-text-primary">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account */}
        <Text className="font-sans text-xs text-text-muted uppercase tracking-widest px-5 py-2">
          Account
        </Text>
        <SettingsRow
          icon={<User size={18} color="#6B6B6B" />}
          label="Edit profile"
          onPress={() => router.push('/settings/edit-profile')}
        />
        <SettingsRow
          icon={<Lock size={18} color="#6B6B6B" />}
          label="Privacy"
          onPress={() => router.push('/settings/privacy')}
        />

        {/* Notifications */}
        <Text className="font-sans text-xs text-text-muted uppercase tracking-widest px-5 py-2 mt-4">
          Notifications
        </Text>
        <SettingsRow
          icon={<Bell size={18} color="#6B6B6B" />}
          label="Notifications"
          onPress={() => router.push('/settings/notifications')}
        />

        {/* Sign out */}
        <View className="mt-8">
          <SettingsRow
            icon={<LogOut size={18} color="#E0443A" />}
            label="Sign out"
            onPress={confirmSignOut}
            destructive
          />
        </View>

        {/* Version */}
        <Text className="font-sans text-xs text-text-muted text-center mt-8 mb-4">
          Drape v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
