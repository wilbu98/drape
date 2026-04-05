import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { registerForPushNotifications } from '@/lib/notifications'
import { useAuthStore } from '@/stores/authStore'

export function useNotifications() {
  const { session } = useAuthStore()
  const router = useRouter()
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()

  useEffect(() => {
    if (!session) return

    // Register and save token
    registerForPushNotifications(session.user.id)

    // Listen for notifications while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Notification received in foreground — no-op, badge handled automatically
    })

    // Handle tap on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>

      if (data?.postId) router.push(`/post/${data.postId}`)
      else if (data?.username) router.push(`/profile/${data.username}`)
      else router.push('/(tabs)')
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [session])
}
