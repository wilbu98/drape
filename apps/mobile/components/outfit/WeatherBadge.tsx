import { View, Text } from 'react-native'
import { Sun, Cloud, CloudRain, CloudSnow, Zap, CloudDrizzle } from 'lucide-react-native'
import type { WeatherData } from '@/lib/weather'

interface WeatherBadgeProps {
  weather: WeatherData
}

function WeatherIcon({ condition }: { condition: string }) {
  const props = { size: 16, color: '#6B6B6B' }
  switch (condition) {
    case 'Sunny': return <Sun {...props} color="#F59E0B" />
    case 'Partly Cloudy': return <Cloud {...props} />
    case 'Cloudy': return <Cloud {...props} />
    case 'Rainy': return <CloudRain {...props} color="#3B82F6" />
    case 'Snowy': return <CloudSnow {...props} color="#93C5FD" />
    case 'Stormy': return <Zap {...props} color="#8B5CF6" />
    default: return <Sun {...props} />
  }
}

export function WeatherBadge({ weather }: WeatherBadgeProps) {
  return (
    <View className="flex-row items-center bg-surface border border-border rounded-pill px-3 py-1.5 gap-1.5">
      <WeatherIcon condition={weather.condition} />
      <Text className="font-sans text-sm text-text-primary">{weather.temp}°</Text>
      <Text className="font-sans text-sm text-text-secondary">{weather.condition}</Text>
      {weather.precipitation_chance > 20 && (
        <Text className="font-sans text-sm text-text-muted">· {weather.precipitation_chance}% rain</Text>
      )}
    </View>
  )
}
