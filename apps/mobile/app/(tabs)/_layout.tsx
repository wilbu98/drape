import { Tabs } from 'expo-router'
import { Home, Shirt, Plus, Rss, User } from 'lucide-react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8E8E8',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{ tabBarIcon: ({ color, size }) => <Shirt color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="post"
        options={{ tabBarIcon: ({ color, size }) => <Plus color={color} size={size} strokeWidth={2.5} /> }}
      />
      <Tabs.Screen
        name="feed"
        options={{ tabBarIcon: ({ color, size }) => <Rss color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  )
}
