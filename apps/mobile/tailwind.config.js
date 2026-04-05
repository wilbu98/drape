/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode
        background: '#FAFAFA',
        surface: '#FFFFFF',
        'surface-raised': '#F4F4F4',
        border: '#E8E8E8',
        'text-primary': '#111111',
        'text-secondary': '#6B6B6B',
        'text-muted': '#AAAAAA',
        accent: '#1A1A1A',
        'accent-soft': '#F0EDE8',
        tag: '#111111',
        'tag-text': '#FFFFFF',
        success: '#2D9B6F',
        error: '#E0443A',
      },
      fontFamily: {
        sans: ['DMSans_400Regular'],
        'sans-medium': ['DMSans_500Medium'],
        'sans-bold': ['DMSans_700Bold'],
        serif: ['InstrumentSerif_400Regular'],
        mono: ['DMMono_400Regular'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
