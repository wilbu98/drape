import { useEffect, useRef } from 'react'
import { Animated, View, StyleSheet } from 'react-native'

interface SkeletonProps {
  width?: number | string
  height?: number
  rounded?: boolean
  className?: string
}

export function Skeleton({ width, height = 16, rounded = false, className }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [])

  return (
    <Animated.View
      style={[
        {
          width: width as any ?? '100%',
          height,
          backgroundColor: '#E8E8E8',
          borderRadius: rounded ? 999 : 8,
          opacity,
        },
      ]}
    />
  )
}

export function PostCardSkeleton() {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
        <Skeleton width={36} height={36} rounded />
        <View style={{ marginLeft: 12, gap: 6, flex: 1 }}>
          <Skeleton width={120} height={12} />
          <Skeleton width={80} height={10} />
        </View>
      </View>
      <Skeleton width="100%" height={400} rounded={false} />
      <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Skeleton width={60} height={14} />
          <Skeleton width={60} height={14} />
        </View>
        <Skeleton width="80%" height={12} />
      </View>
    </View>
  )
}

export function WardrobeGridSkeleton() {
  const tiles = Array.from({ length: 6 })
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 }}>
      {tiles.map((_, i) => (
        <View key={i} style={{ width: '47%' }}>
          <Skeleton width="100%" height={200} />
          <View style={{ marginTop: 8, gap: 6 }}>
            <Skeleton width="70%" height={10} />
            <Skeleton width="40%" height={10} />
          </View>
        </View>
      ))}
    </View>
  )
}

export function ProfileSkeleton() {
  return (
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Skeleton width={80} height={80} rounded />
        <View style={{ flex: 1, marginLeft: 24, flexDirection: 'row', justifyContent: 'space-around' }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ alignItems: 'center', gap: 6 }}>
              <Skeleton width={32} height={20} />
              <Skeleton width={48} height={10} />
            </View>
          ))}
        </View>
      </View>
      <Skeleton width={140} height={14} />
      <View style={{ marginTop: 8 }}>
        <Skeleton width="90%" height={12} />
      </View>
      <View style={{ marginTop: 16 }}>
        <Skeleton width="100%" height={36} />
      </View>
    </View>
  )
}
