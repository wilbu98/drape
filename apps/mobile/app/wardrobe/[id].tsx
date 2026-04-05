import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useWardrobe } from '@/hooks/useWardrobe'
import { useAuthStore } from '@/stores/authStore'
import { CLOTHING_CATEGORIES } from '@drape/shared'
import type { ClothingCategory } from '@drape/shared'
import * as Linking from 'expo-linking'

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { session } = useAuthStore()
  const { items, updateItem, deleteItem } = useWardrobe()

  const item = items.find((i) => i.id === id)

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  const [name, setName] = useState(item?.name ?? '')
  const [category, setCategory] = useState<ClothingCategory>((item?.category as ClothingCategory) ?? 'Tops')
  const [subcategory, setSubcategory] = useState(item?.subcategory ?? '')
  const [brand, setBrand] = useState(item?.brand ?? '')
  const [colors, setColors] = useState(item?.colors?.join(', ') ?? '')
  const [purchaseUrl, setPurchaseUrl] = useState(item?.purchase_url ?? '')

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="font-sans text-text-secondary">Item not found</Text>
      </SafeAreaView>
    )
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give this item a name.')
      return
    }
    setLoading(true)

    let photoUrl = item.photo_url

    if (photoUri && session) {
      const ext = photoUri.split('.').pop() ?? 'jpg'
      const path = `${session.user.id}/${Date.now()}.${ext}`
      const formData = new FormData()
      formData.append('file', { uri: photoUri, name: `item.${ext}`, type: `image/${ext}` } as any)
      const { error: uploadError } = await supabase.storage.from('wardrobe').upload(path, formData)
      if (!uploadError) {
        const { data } = supabase.storage.from('wardrobe').getPublicUrl(path)
        photoUrl = data.publicUrl
      }
    }

    try {
      await updateItem({
        id: item.id,
        name: name.trim(),
        category,
        subcategory: subcategory.trim() || null,
        brand: brand.trim() || null,
        photo_url: photoUrl,
        purchase_url: purchaseUrl.trim() || null,
        colors: colors.split(',').map((c) => c.trim()).filter(Boolean),
      })
      setEditing(false)
      setPhotoUri(null)
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Remove item',
      `Remove "${item.name}" from your wardrobe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(item.id)
            router.back()
          },
        },
      ]
    )
  }

  const displayPhoto = photoUri ?? item.photo_url

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={22} color="#111111" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-3">
            {!editing ? (
              <>
                <TouchableOpacity onPress={confirmDelete} className="p-2">
                  <Trash2 size={18} color="#E0443A" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEditing(true)}
                  className="bg-surface border border-border rounded-btn px-4 h-8 items-center justify-center"
                >
                  <Text className="font-sans text-sm text-text-primary">Edit</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => { setEditing(false); setPhotoUri(null) }}
                className="border border-border rounded-btn px-4 h-8 items-center justify-center"
              >
                <Text className="font-sans text-sm text-text-secondary">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Photo */}
        <TouchableOpacity
          onPress={editing ? pickPhoto : undefined}
          activeOpacity={editing ? 0.7 : 1}
          className="mx-5 mb-5"
        >
          {displayPhoto ? (
            <Image
              source={{ uri: displayPhoto }}
              className="w-full aspect-[3/4] rounded-card"
              contentFit="cover"
            />
          ) : (
            <View className="w-full aspect-[3/4] rounded-card bg-surface-raised items-center justify-center">
              <Text className="font-sans text-text-muted">{editing ? 'Tap to add photo' : 'No photo'}</Text>
            </View>
          )}
          {editing && (
            <View className="absolute bottom-3 right-3 bg-accent rounded-pill px-3 py-1.5">
              <Text className="font-sans text-white text-xs">Change photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="px-5">
          {editing ? (
            <View className="gap-4">
              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Name</Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {CLOTHING_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        className={`px-4 h-9 rounded-pill border items-center justify-center ${
                          category === cat ? 'bg-accent border-accent' : 'bg-surface border-border'
                        }`}
                      >
                        <Text className={`font-sans text-sm ${category === cat ? 'text-white' : 'text-text-primary'}`}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Brand</Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="e.g. Zara"
                  placeholderTextColor="#AAAAAA"
                />
              </View>

              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Colors</Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  value={colors}
                  onChangeText={setColors}
                  placeholder="e.g. White, Navy"
                  placeholderTextColor="#AAAAAA"
                />
              </View>

              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Purchase link</Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  value={purchaseUrl}
                  onChangeText={setPurchaseUrl}
                  placeholder="https://..."
                  placeholderTextColor="#AAAAAA"
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className="bg-accent rounded-btn h-12 items-center justify-center mt-2"
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text className="font-sans-bold text-white text-base">Save changes</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Item info */}
              <Text className="font-serif text-2xl text-text-primary mb-1">{item.name}</Text>
              {item.brand && (
                <Text className="font-mono text-sm text-text-secondary mb-3">{item.brand}</Text>
              )}

              <View className="flex-row flex-wrap gap-2 mb-4">
                <View className="bg-surface-raised rounded-pill px-3 py-1">
                  <Text className="font-sans text-sm text-text-secondary">{item.category}</Text>
                </View>
                {item.subcategory && (
                  <View className="bg-surface-raised rounded-pill px-3 py-1">
                    <Text className="font-sans text-sm text-text-secondary">{item.subcategory}</Text>
                  </View>
                )}
                {item.colors?.map((color) => (
                  <View key={color} className="bg-surface-raised rounded-pill px-3 py-1">
                    <Text className="font-sans text-sm text-text-secondary">{color}</Text>
                  </View>
                ))}
              </View>

              {/* Stats */}
              <View className="flex-row bg-surface border border-border rounded-card p-4 mb-4 gap-6">
                <View className="items-center">
                  <Text className="font-serif text-2xl text-text-primary">{item.times_worn}</Text>
                  <Text className="font-sans text-xs text-text-muted">times worn</Text>
                </View>
                {item.last_worn_at && (
                  <View>
                    <Text className="font-sans text-sm text-text-primary">
                      {new Date(item.last_worn_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                    <Text className="font-sans text-xs text-text-muted">last worn</Text>
                  </View>
                )}
              </View>

              {/* Purchase link */}
              {item.purchase_url && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(item.purchase_url!)}
                  className="flex-row items-center gap-2 border border-border rounded-btn h-11 px-4 justify-center"
                >
                  <ExternalLink size={15} color="#6B6B6B" />
                  <Text className="font-sans text-text-secondary">View original listing</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
