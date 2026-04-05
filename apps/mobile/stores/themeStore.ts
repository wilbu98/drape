import { create } from 'zustand'

type ColorScheme = 'system' | 'light' | 'dark'

interface ThemeState {
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  colorScheme: 'system',
  setColorScheme: (colorScheme) => set({ colorScheme }),
}))
