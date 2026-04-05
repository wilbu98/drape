import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Dimensions, Modal,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { ArrowLeft, Camera, Tag, X, Check } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useWardrobe } from '@/hooks/useWardrobe'
import { useQueryClient } from '@tanstack/react-query'
import { ACTIVITY_TYPES } from '@drape/shared'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const PHOTO_HEIGHT = SCREEN_WIDTH * 1.25

interface ItemTag {
  wardrobe_item_id: string | null
  item_name: string
  source_url: string | null
  x_pos: number
  y_pos: number
}

export default function NewPostScreen() {
  const router = useRouter()
  const { session } = useAuthStore()
  const { items: wardrobe } = useWardrobe()
  const queryClient = useQueryClient()

  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [activity, setActivity] = useState('')
  const [tags, setTags] = useState<ItemTag[]>([])
  const [loading, setLoading] = useState(false)

  // Tag placement state
  const [tagging, setTagging] = useState(false)
  const [pendingTag, setPendingTag] = useState<{ x: number; y: number } | null>(null)
  const [showItemPicker, setShowItemPicker] = useState(false)

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function takePhoto() {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  function handlePhotoTap(evt: any) {
    if (!tagging) return
    const { locationX, locationY } = evt.nativeEvent
    const x = locationX / SCREEN_WIDTH
    const y = locationY / PHOTO_HEIGHT
    setPendingTag({ x, y })
    setShowItemPicker(true)
  }

  function selectItemForTag(itemId: string | null, itemName: string, sourceUrl: string | null) {
    if (!pendingTag) return
    setTags((prev) => [...prev, {
      wardrobe_item_id: itemId,
      item_name: itemName,
      source_url: sourceUrl,
      x_pos: pendingTag.x,
      y_pos: pendingTag.y,
    }])
    setPendingTag(null)
    setShowItemPicker(false)
    setTagging(false)
  }

  function removeTag(index: number) {
    setTags((prev) => prev.filter((_, i) => i !== index))
  }

  async function handlePost() {
    if (!photoUri) {
      Alert.alert('No photo', 'Add a photo first.')
      return
    }
    setLoading(true)

    try {
      // Upload photo
      const ext = photoUri.split('.').pop() ?? 'jpg'
      const path = `${session!.user.id}/${Date.now()}.${ext}`
      const formData = new FormData()
      formData.append('file', { uri: photoUri, name: `post.${ext}`, type: `image/${ext}` } as any)
      const { error: uploadError } = await supabase.storage.from('posts').upload(path, formData)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('posts').getPublicUrl(path)

      // Create post
      const { data: post, error: postError } = await supabase
        .from('outfit_posts')
        .insert({
          user_id: session!.user.id,
          photo_url: urlData.publicUrl,
          caption: caption.trim() || null,
          activity_context: activity || null,
          visibility: 'public',
        })
        .select()
        .single()
      if (postError) throw postError

      // Insert item tags
      if (tags.length > 0) {
        await supabase.from('post_item_tags').insert(
          tags.map((tag) => ({ ...tag, post_id: post.id }))
        )
      }

      queryClient.invalidateQueries({ queryKey: ['feed'] })
      router.replace('/(tabs)/feed')
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={22} color="#111111" />
          </TouchableOpacity>
          <Text className="font-serif text-xl text-text-primary">New post</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={loading || !photoUri}
            className={`bg-accent rounded-btn px-5 h-9 items-center justify-center ${!photoUri ? 'opacity-40' : ''}`}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text className="font-sans-bold text-white">Share</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Photo area */}
        {photoUri ? (
          <View>
            <TouchableOpacity
              activeOpacity={tagging ? 0.9 : 1}
              onPress={handlePhotoTap}
            >
              <Image
                source={{ uri: photoUri }}
                style={{ width: SCREEN_WIDTH, height: PHOTO_HEIGHT }}
                contentFit="cover"
              />

              {/* Tag dots */}
              {tags.map((tag, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => removeTag(i)}
                  style={{
                    position: 'absolute',
                    left: tag.x_pos * SCREEN_WIDTH - 14,
                    top: tag.y_pos * PHOTO_HEIGHT - 14,
                  }}
                  className="w-7 h-7 bg-white rounded-pill items-center justify-center shadow-card"
                >
                  <Tag size={12} color="#111111" />
                </TouchableOpacity>
              ))}

              {tagging && (
                <View className="absolute bottom-4 left-0 right-0 items-center">
                  <View className="bg-black/60 rounded-pill px-4 py-2">
                    <Text className="font-sans text-white text-sm">Tap photo to tag an item</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Photo actions */}
            <View className="flex-row gap-2 px-4 pt-3">
              <TouchableOpacity
                onPress={() => setTagging(!tagging)}
                className={`flex-row items-center gap-1.5 border rounded-pill px-4 h-9 ${tagging ? 'bg-accent border-accent' : 'bg-surface border-border'}`}
              >
                <Tag size={14} color={tagging ? '#FFFFFF' : '#6B6B6B'} />
                <Text className={`font-sans text-sm ${tagging ? 'text-white' : 'text-text-secondary'}`}>
                  {tagging ? 'Tagging...' : 'Tag items'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPhotoUri(null)}
                className="border border-border rounded-pill px-4 h-9 items-center justify-center"
              >
                <Text className="font-sans text-sm text-text-secondary">Change photo</Text>
              </TouchableOpacity>
            </View>

            {/* Tagged items list */}
            {tags.length > 0 && (
              <View className="px-4 pt-3">
                <Text className="font-sans text-sm text-text-secondary mb-2">Tagged items</Text>
                {tags.map((tag, i) => (
                  <View key={i} className="flex-row items-center bg-surface border border-border rounded-btn px-3 py-2 mb-2">
                    <Text className="flex-1 font-sans text-sm text-text-primary">{tag.item_name}</Text>
                    <TouchableOpacity onPress={() => removeTag(i)}>
                      <X size={15} color="#AAAAAA" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View className="mx-5 mb-4">
            <TouchableOpacity
              onPress={pickPhoto}
              className="w-full bg-surface border border-border rounded-card items-center justify-center"
              style={{ height: PHOTO_HEIGHT * 0.6 }}
            >
              <Camera size={36} color="#AAAAAA" />
              <Text className="font-sans text-text-muted mt-3">Add a photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePhoto}
              className="border border-border rounded-btn h-11 items-center justify-center mt-3"
            >
              <Text className="font-sans text-text-secondary">Take photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Caption */}
        <View className="px-5 pt-4">
          <TextInput
            className="font-sans text-text-primary text-base"
            placeholder="Write a caption..."
            placeholderTextColor="#AAAAAA"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
          />
        </View>

        {/* Activity */}
        <View className="px-5 pt-5">
          <Text className="font-sans text-sm text-text-secondary mb-2">Activity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {ACTIVITY_TYPES.map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setActivity(activity === a ? '' : a)}
                  className={`px-4 h-8 rounded-pill border items-center justify-center ${activity === a ? 'bg-accent border-accent' : 'bg-surface border-border'}`}
                >
                  <Text className={`font-sans text-sm ${activity === a ? 'text-white' : 'text-text-primary'}`}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Item picker modal */}
      <Modal visible={showItemPicker} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-background rounded-t-2xl pt-4 pb-8 max-h-[60%]">
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text className="font-serif text-xl text-text-primary">Tag an item</Text>
              <TouchableOpacity onPress={() => { setShowItemPicker(false); setPendingTag(null) }}>
                <X size={22} color="#111111" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
              {wardrobe.length === 0 ? (
                <Text className="font-sans text-text-muted text-center py-6">
                  No wardrobe items yet
                </Text>
              ) : (
                wardrobe.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => selectItemForTag(item.id, item.name, item.purchase_url)}
                    className="flex-row items-center py-3 border-b border-border"
                  >
                    {item.photo_url ? (
                      <Image
                        source={{ uri: item.photo_url }}
                        className="w-12 h-12 rounded-btn mr-3"
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-btn bg-surface-raised mr-3" />
                    )}
                    <View className="flex-1">
                      <Text className="font-sans text-text-primary">{item.name}</Text>
                      <Text className="font-sans text-xs text-text-muted">{item.category}{item.brand ? ` · ${item.brand}` : ''}</Text>
                    </View>
                    <Check size={16} color="#AAAAAA" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
