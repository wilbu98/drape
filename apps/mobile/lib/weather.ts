type WeatherCondition = 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rainy' | 'Snowy' | 'Stormy'

export interface WeatherData {
  temp: number
  condition: WeatherCondition
  precipitation_chance: number
  high: number
  low: number
}

function mapWeatherCode(code: number): WeatherCondition {
  if (code === 0) return 'Sunny'
  if (code <= 2) return 'Partly Cloudy'
  if (code <= 3) return 'Cloudy'
  if (code <= 67) return 'Rainy'
  if (code <= 77) return 'Snowy'
  return 'Stormy'
}

export async function getWeather(lat: number, lng: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather')
  const data = await res.json()
  return {
    temp: Math.round(data.current_weather.temperature),
    condition: mapWeatherCode(data.current_weather.weathercode),
    precipitation_chance: data.daily.precipitation_probability_max[0],
    high: Math.round(data.daily.temperature_2m_max[0]),
    low: Math.round(data.daily.temperature_2m_min[0]),
  }
}
