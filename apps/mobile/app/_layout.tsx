import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useThemeStore } from '@/stores/themeStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
})

function RootLayoutNav() {
  const { session, profile } = useAuth()
  const router = useRouter()
  const segments = useSegments()
  useNotifications()

  useEffect(() => {
    const inAuth = segments[0] === '(auth)'
    if (!session && !inAuth) {
      router.replace('/(auth)/login')
    } else if (session && !profile && !inAuth) {
      router.replace('/(auth)/onboarding/profile')
    } else if (session && profile && inAuth) {
      router.replace('/(tabs)')
    }
  }, [session, profile, segments])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="wardrobe" />
      <Stack.Screen name="post" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
    </Stack>
  )
}

export default function RootLayout() {
  const systemScheme = useColorScheme()
  const { colorScheme } = useThemeStore()
  const isDark = colorScheme === 'dark' || (colorScheme === 'system' && systemScheme === 'dark')

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootLayoutNav />
    </QueryClientProvider>
  )
}
