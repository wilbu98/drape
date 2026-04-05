import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  ArrowLeft, User, Bell, Lock, Moon, LogOut, ChevronRight, Sun, Smartphone,
} from 'lucide-react-native'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { supabase } from '@/lib/supabase'

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onPress?: () => void
  right?: React.ReactNode
  destructive?: boolean
}

function SettingsRow({ icon, label, sublabel, onPress, right, destructive }: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-5 py-4 border-b border-border bg-surface"
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="w-7 mr-4 items-center">{icon}</View>
      <View className="flex-1">
        <Text className={`font-sans text-base ${destructive ? 'text-error' : 'text-text-primary'}`}>
          {label}
        </Text>
        {sublabel && (
          <Text className="font-sans text-xs text-text-muted mt-0.5">{sublabel}</Text>
        )}
      </View>
      {right ?? (onPress && <ChevronRight size={16} color="#AAAAAA" />)}
    </TouchableOpacity>
  )
}

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: Smartphone },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const

export default function SettingsScreen() {
  const router = useRouter()
  const { signOut } = useAuthStore()
  const { colorScheme, setColorScheme } = useThemeStore()

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

        {/* Appearance */}
        <Text className="font-sans text-xs text-text-muted uppercase tracking-widest px-5 py-2 mt-4">
          Appearance
        </Text>
        <View className="bg-surface border-b border-border px-5 py-4">
          <Text className="font-sans text-base text-text-primary mb-3">Theme</Text>
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = colorScheme === value
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => setColorScheme(value)}
                  className={`flex-1 items-center py-3 rounded-btn border gap-1.5 ${
                    active ? 'bg-accent border-accent' : 'bg-surface-raised border-border'
                  }`}
                >
                  <Icon size={17} color={active ? '#FFFFFF' : '#6B6B6B'} />
                  <Text className={`font-sans text-sm ${active ? 'text-white' : 'text-text-secondary'}`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Sign out */}
        <View className="mt-8">
          <SettingsRow
            icon={<LogOut size={18} color="#E0443A" />}
            label="Sign out"
            onPress={confirmSignOut}
            destructive
          />
        </View>

        <Text className="font-sans text-xs text-text-muted text-center mt-8 mb-4">
          Drape v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
