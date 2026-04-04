import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Drape — Get dressed. Share your style.',
  description: 'Your daily outfit companion. AI-powered outfit generation, digital wardrobe, and social feed.',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
