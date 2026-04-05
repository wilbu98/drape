import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Camera, Link, PenLine, ArrowLeft, X } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { parseItemUrl } from '@/lib/claude'
import { useWardrobe } from '@/hooks/useWardrobe'
import { useAuthStore } from '@/stores/authStore'
import { CLOTHING_CATEGORIES } from '@drape/shared'
import type { ClothingCategory } from '@drape/shared'

type AddMode = 'photo' | 'url' | 'manual'

export default function AddItemScreen() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { addItem } = useWardrobe()

  const [mode, setMode] = useState<AddMode>('photo')
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)

  // Form fields
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ClothingCategory>('Tops')
  const [subcategory, setSubcategory] = useState('')
  const [brand, setBrand] = useState('')
  const [colors, setColors] = useState('')
  const [purchaseUrl, setPurchaseUrl] = useState('')
  const [urlInput, setUrlInput] = useState('')

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function takePhoto() {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function parseUrl() {
    if (!urlInput.trim()) return
    setParsing(true)
    try {
      const parsed = await parseItemUrl(urlInput.trim())
      setName(parsed.name)
      setBrand(parsed.brand ?? '')
      setCategory(parsed.category as ClothingCategory)
      setSubcategory(parsed.subcategory ?? '')
      setColors(parsed.colors.join(', '))
      setPurchaseUrl(parsed.purchase_url)
      setMode('manual')
    } catch {
      Alert.alert('Could not parse URL', 'Try entering the item details manually.')
      setMode('manual')
    } finally {
      setParsing(false)
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give this item a name.')
      return
    }

    setLoading(true)

    let photoUrl: string | null = null

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
      await addItem({
        name: name.trim(),
        category,
        subcategory: subcategory.trim() || null,
        brand: brand.trim() || null,
        photo_url: photoUrl,
        purchase_url: purchaseUrl.trim() || null,
        colors: colors.split(',').map((c) => c.trim()).filter(Boolean),
        tags: [],
        source: mode,
      })
      router.back()
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-5">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={22} color="#111111" />
          </TouchableOpacity>
          <Text className="font-serif text-2xl text-text-primary">Add item</Text>
        </View>

        {/* Mode selector */}
        <View className="flex-row mx-5 mb-6 bg-surface-raised rounded-btn p-1">
          {([
            { key: 'photo', label: 'Photo', icon: Camera },
            { key: 'url', label: 'URL', icon: Link },
            { key: 'manual', label: 'Manual', icon: PenLine },
          ] as const).map(({ key, label, icon: Icon }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setMode(key)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 h-9 rounded-btn ${
                mode === key ? 'bg-surface shadow-card' : ''
              }`}
            >
              <Icon size={14} color={mode === key ? '#111111' : '#AAAAAA'} />
              <Text className={`font-sans text-sm ${mode === key ? 'text-text-primary' : 'text-text-muted'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="px-5">
          {/* Photo picker */}
          {mode === 'photo' && (
            <View className="mb-6">
              <TouchableOpacity
                onPress={pickPhoto}
                className="w-full h-56 bg-surface border border-border rounded-card items-center justify-center mb-3 overflow-hidden"
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="items-center">
                    <Camera size={32} color="#AAAAAA" />
                    <Text className="font-sans text-text-muted mt-2">Tap to choose photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={takePhoto}
                className="border border-border rounded-btn h-11 items-center justify-center"
              >
                <Text className="font-sans text-text-secondary">Take a photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* URL input */}
          {mode === 'url' && (
            <View className="mb-6">
              <Text className="font-sans text-sm text-text-secondary mb-2">
                Paste a product link — we'll extract the details automatically
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  placeholder="https://shop.com/item..."
                  placeholderTextColor="#AAAAAA"
                  value={urlInput}
                  onChangeText={setUrlInput}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <TouchableOpacity
                  onPress={parseUrl}
                  disabled={parsing || !urlInput.trim()}
                  className="bg-accent rounded-btn px-4 h-12 items-center justify-center"
                >
                  {parsing
                    ? <ActivityIndicator color="#FFFFFF" size="small" />
                    : <Text className="font-sans-bold text-white">Go</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Photo thumbnail (when switching away from photo mode) */}
          {mode !== 'photo' && photoUri && (
            <View className="flex-row items-center bg-surface border border-border rounded-card p-3 mb-4">
              <Image source={{ uri: photoUri }} className="w-12 h-12 rounded-btn mr-3" />
              <Text className="flex-1 font-sans text-sm text-text-secondary">Photo attached</Text>
              <TouchableOpacity onPress={() => setPhotoUri(null)}>
                <X size={16} color="#AAAAAA" />
              </TouchableOpacity>
            </View>
          )}

          {/* Manual fields — always shown for photo/manual, shown after URL parse */}
          {(mode === 'photo' || mode === 'manual') && (
            <View className="gap-4">
              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">
                  Name <Text className="text-error">*</Text>
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  placeholder="e.g. White linen shirt"
                  placeholderTextColor="#AAAAAA"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Category */}
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
                  placeholder="e.g. Zara, H&M, Thrift"
                  placeholderTextColor="#AAAAAA"
                  value={brand}
                  onChangeText={setBrand}
                />
              </View>

              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Colors</Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  placeholder="e.g. White, Navy (comma separated)"
                  placeholderTextColor="#AAAAAA"
                  value={colors}
                  onChangeText={setColors}
                />
              </View>

              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Purchase link</Text>
                <TextInput
                  className="bg-surface border border-border rounded-btn px-4 h-12 font-sans text-text-primary"
                  placeholder="https://..."
                  placeholderTextColor="#AAAAAA"
                  value={purchaseUrl}
                  onChangeText={setPurchaseUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save button — fixed at bottom */}
      <View className="px-5 pb-6 pt-3 border-t border-border bg-background">
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-accent rounded-btn h-12 items-center justify-center"
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text className="font-sans-bold text-white text-base">Save to wardrobe</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
