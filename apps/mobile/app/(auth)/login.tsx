import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) Alert.alert('Login failed', error.message)
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) Alert.alert('Error', error.message)
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-16 pb-8">
            {/* Header */}
            <View className="mb-12">
              <Text className="font-serif text-5xl text-text-primary mb-2">Drape</Text>
              <Text className="font-sans text-text-secondary text-base">
                Get dressed. Share your style.
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4 mb-6">
              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Email</Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  placeholder="you@example.com"
                  placeholderTextColor="#AAAAAA"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Password</Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  placeholder="••••••••"
                  placeholderTextColor="#AAAAAA"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              className="bg-accent rounded-btn h-12 items-center justify-center mb-4"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text className="font-sans-bold text-white text-base">Sign in</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="font-sans text-text-muted text-sm mx-3">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Google */}
            <TouchableOpacity
              className="bg-surface border border-border rounded-btn h-12 items-center justify-center mb-3"
              onPress={handleGoogleLogin}
            >
              <Text className="font-sans text-text-primary text-base">Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="font-sans text-text-secondary">Don't have an account? </Text>
              <Link href="/(auth)/signup">
                <Text className="font-sans-bold text-text-primary">Sign up</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
