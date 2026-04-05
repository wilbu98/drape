import { useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Image, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Plus, X } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { CLOTHING_CATEGORIES } from '@drape/shared'
import type { ClothingCategory } from '@drape/shared'

interface DraftItem {
  name: string
  category: ClothingCategory
  uri: string | null
}

export default function OnboardingWardrobe() {
  const router = useRouter()
  const { session } = useAuthStore()
  const [items, setItems] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftCategory, setDraftCategory] = useState<ClothingCategory>('Tops')
  const [draftUri, setDraftUri] = useState<string | null>(null)

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })
    if (!result.canceled) setDraftUri(result.assets[0].uri)
  }

  function addItem() {
    if (!draftName.trim()) {
      Alert.alert('Name required', 'Give this item a name.')
      return
    }
    setItems((prev) => [...prev, { name: draftName.trim(), category: draftCategory, uri: draftUri }])
    setDraftName('')
    setDraftCategory('Tops')
    setDraftUri(null)
    setAdding(false)
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleFinish() {
    setLoading(true)

    for (const item of items) {
      let photoUrl: string | null = null

      if (item.uri && session) {
        const ext = item.uri.split('.').pop()
        const path = `${session.user.id}/${Date.now()}.${ext}`
        const formData = new FormData()
        formData.append('file', { uri: item.uri, name: `item.${ext}`, type: `image/${ext}` } as any)
        const { error: uploadError } = await supabase.storage
          .from('wardrobe')
          .upload(path, formData)
        if (!uploadError) {
          const { data } = supabase.storage.from('wardrobe').getPublicUrl(path)
          photoUrl = data.publicUrl
        }
      }

      await supabase.from('wardrobe_items').insert({
        user_id: session?.user.id,
        name: item.name,
        category: item.category,
        photo_url: photoUrl,
        source: 'onboarding',
      })
    }

    setLoading(false)
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View className="px-6 pt-10">
          {/* Progress */}
          <View className="flex-row gap-1 mb-10">
            {[1, 2, 3, 4].map((step) => (
              <View key={step} className="flex-1 h-1 rounded-pill bg-accent" />
            ))}
          </View>

          <Text className="font-serif text-3xl text-text-primary mb-2">Your wardrobe</Text>
          <Text className="font-sans text-text-secondary mb-8">
            Add a few items to get started — you can add more later
          </Text>

          {/* Items list */}
          {items.map((item, index) => (
            <View
              key={index}
              className="flex-row items-center bg-surface border border-border rounded-card p-3 mb-3"
            >
              {item.uri ? (
                <Image source={{ uri: item.uri }} className="w-14 h-14 rounded-btn mr-3" />
              ) : (
                <View className="w-14 h-14 rounded-btn bg-surface-raised mr-3" />
              )}
              <View className="flex-1">
                <Text className="font-sans-bold text-text-primary">{item.name}</Text>
                <Text className="font-sans text-text-secondary text-sm">{item.category}</Text>
              </View>
              <TouchableOpacity onPress={() => removeItem(index)} className="p-2">
                <X size={18} color="#AAAAAA" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add item form */}
          {adding ? (
            <View className="bg-surface border border-border rounded-card p-4 mb-4">
              <TouchableOpacity
                onPress={pickImage}
                className="w-full h-32 bg-surface-raised rounded-btn items-center justify-center mb-4"
              >
                {draftUri ? (
                  <Image source={{ uri: draftUri }} className="w-full h-full rounded-btn" />
                ) : (
                  <Text className="font-sans text-text-muted">Tap to add photo</Text>
                )}
              </TouchableOpacity>

              <TextInput
                className="bg-background border border-border rounded-btn px-4 h-12 font-sans text-text-primary mb-3"
                placeholder="Item name (e.g. White linen shirt)"
                placeholderTextColor="#AAAAAA"
                value={draftName}
                onChangeText={setDraftName}
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row gap-2">
                  {CLOTHING_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setDraftCategory(cat)}
                      className={`px-3 h-8 rounded-pill border items-center justify-center ${
                        draftCategory === cat ? 'bg-accent border-accent' : 'bg-surface border-border'
                      }`}
                    >
                      <Text className={`font-sans text-sm ${draftCategory === cat ? 'text-white' : 'text-text-primary'}`}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 h-10 border border-border rounded-btn items-center justify-center"
                  onPress={() => setAdding(false)}
                >
                  <Text className="font-sans text-text-secondary">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 h-10 bg-accent rounded-btn items-center justify-center"
                  onPress={addItem}
                >
                  <Text className="font-sans-bold text-white">Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-center border border-dashed border-border rounded-card h-14 mb-6"
              onPress={() => setAdding(true)}
            >
              <Plus size={18} color="#AAAAAA" />
              <Text className="font-sans text-text-muted ml-2">Add clothing item</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="bg-accent rounded-btn h-12 items-center justify-center mb-3"
            onPress={handleFinish}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text className="font-sans-bold text-white text-base">
                  {items.length > 0 ? 'Finish setup' : 'Skip for now'}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
