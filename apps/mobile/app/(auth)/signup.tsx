import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function SignupScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords don't match', 'Please make sure your passwords match.')
      return
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (error) {
      Alert.alert('Sign up failed', error.message)
    } else {
      router.replace('/(auth)/onboarding/profile')
    }
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
                Create your account
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
                  placeholder="At least 8 characters"
                  placeholderTextColor="#AAAAAA"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Confirm password</Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  placeholder="••••••••"
                  placeholderTextColor="#AAAAAA"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className="bg-accent rounded-btn h-12 items-center justify-center mb-4"
              onPress={handleSignup}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text className="font-sans-bold text-white text-base">Create account</Text>
              }
            </TouchableOpacity>

            {/* Terms */}
            <Text className="font-sans text-text-muted text-xs text-center mb-6">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </Text>

            {/* Login Link */}
            <View className="flex-row justify-center">
              <Text className="font-sans text-text-secondary">Already have an account? </Text>
              <Link href="/(auth)/login">
                <Text className="font-sans-bold text-text-primary">Sign in</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
