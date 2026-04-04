# CLAUDE.md — Drape

This is the single source of truth for building Drape. Read this entire file before writing any code. Every decision — naming, structure, stack, feature scope — is defined here.

---

## What is Drape?

Drape is a daily outfit companion app. It generates a personalized outfit every morning based on the user's saved wardrobe, the day's weather, and their planned activities. Users can post their daily looks to a friend feed, tag individual clothing items with source links, and discover what their friends are wearing and buying.

**Core loop:**
```
Open app → See today's outfit → Accept / Swap / Regenerate → (Optional) Post look to feed
```

**Tagline:** *Get dressed. Share your style.*

---

## Target Users

- Age range: 15–50
- Anyone who gets dressed daily and wants less friction in the morning
- Style-conscious people who enjoy sharing outfits and discovering new pieces
- Shoppers who want to know exactly where a friend got their look

---

## Aesthetic & Design System

Drape should feel like a modern social app — think Instagram meets Strava, but for fashion. Clean, contemporary, image-forward. Not a utility app. Not overly minimal. It should feel alive.

### Principles
- **Image-first** — clothing photos and outfit cards dominate every screen
- **Fast** — zero friction in the morning, one tap to accept an outfit
- **Social** — the feed feels warm and personal, not algorithmic
- **Contemporary** — design trends current as of 2025, not dated Material UI defaults

### Colors
```
--color-background: #FAFAFA
--color-surface: #FFFFFF
--color-surface-raised: #F4F4F4
--color-border: #E8E8E8
--color-text-primary: #111111
--color-text-secondary: #6B6B6B
--color-text-muted: #AAAAAA
--color-accent: #1A1A1A
--color-accent-soft: #F0EDE8
--color-tag: #111111
--color-tag-text: #FFFFFF
--color-success: #2D9B6F
--color-error: #E0443A
```

Dark mode:
```
--color-background: #0E0E0E
--color-surface: #1A1A1A
--color-surface-raised: #242424
--color-border: #2E2E2E
--color-text-primary: #F5F5F5
--color-text-secondary: #999999
--color-text-muted: #555555
--color-accent: #F5F5F5
--color-accent-soft: #1F1E1C
```

### Typography
- **Display / Headings:** `Instrument Serif` (Google Fonts)
- **Body / UI:** `DM Sans` (Google Fonts)
- **Monospace / Tags:** `DM Mono`

### Spacing Scale
8px base grid. Tokens: 4, 8, 12, 16, 24, 32, 48, 64.

### Component Style
- Border radius: `12px` cards, `8px` buttons/inputs, `999px` pills/tags
- Shadows: `0 1px 4px rgba(0,0,0,0.06)`
- No heavy borders — use surface color differences for depth
- Buttons: filled primary (black), ghost secondary, text tertiary
- Icons: `lucide-react` throughout

---

## Platform

- **Mobile:** React Native with Expo (iOS + Android)
- **Web:** Next.js 14 App Router — PWA-enabled
- Both share the same Supabase backend

---

## Tech Stack

### Mobile (Expo)
```
React Native + Expo SDK 51+
Expo Router (file-based routing)
NativeWind (Tailwind for React Native)
TanStack Query v5
Zustand
Expo Image
Expo Location
Expo Notifications
Expo Camera
React Native Reanimated
```

### Web (Next.js)
```
Next.js 14 App Router
Tailwind CSS
Shadcn/ui
TanStack Query v5
Zustand
next/image
```

### Backend
```
Supabase
  - PostgreSQL
  - Supabase Auth (email, Google, Apple)
  - Supabase Storage (photos)
  - Supabase Realtime (feed, notifications)
  - Row Level Security on all tables
  - Edge Functions (Deno) for AI + webhooks
```

### AI
```
Google Gemini 1.5 Flash  — outfit generation (high frequency, fast)
Claude claude-sonnet-4-20250514       — item URL parsing, style analysis (low frequency)
Google Vision API         — auto-categorize clothing photos on upload
```

### Weather
```
Open-Meteo (free, no API key required)
https://api.open-meteo.com/v1/forecast
Params: latitude, longitude, current_weather, daily temperature, precipitation_probability
```

### Notifications
```
Expo Push Notifications + FCM (Android) + APNs (iOS)
Triggered via Supabase Edge Function cron
```

---

## Project Structure

```
drape/
├── apps/
│   ├── mobile/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx
│   │   │   │   ├── signup.tsx
│   │   │   │   └── onboarding/
│   │   │   │       ├── profile.tsx
│   │   │   │       ├── location.tsx
│   │   │   │       ├── style.tsx
│   │   │   │       └── wardrobe.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx        # Home — daily outfit card
│   │   │   │   ├── wardrobe.tsx     # Digital closet
│   │   │   │   ├── feed.tsx         # Friend feed
│   │   │   │   ├── explore.tsx      # Discovery
│   │   │   │   └── profile.tsx      # User profile
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   │   ├── outfit/
│   │   │   ├── wardrobe/
│   │   │   ├── feed/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── gemini.ts
│   │   │   ├── claude.ts
│   │   │   └── weather.ts
│   │   ├── stores/
│   │   └── types/
│   │
│   └── web/
│       ├── app/
│       │   ├── (auth)/
│       │   └── (app)/
│       │       ├── page.tsx
│       │       ├── wardrobe/
│       │       ├── feed/
│       │       ├── explore/
│       │       └── profile/
│       ├── components/
│       ├── lib/
│       └── types/
│
├── packages/
│   └── shared/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   │   ├── generate-outfit/
│   │   ├── parse-item-url/
│   │   └── send-notification/
│   └── seed.sql
│
└── CLAUDE.md
```

---

## Database Schema

```sql
-- Profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location_city TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  style_preferences TEXT[],
  activity_defaults TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wardrobe Items
CREATE TABLE public.wardrobe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  colors TEXT[],
  brand TEXT,
  photo_url TEXT,
  purchase_url TEXT,
  tags TEXT[],
  last_worn_at TIMESTAMPTZ,
  times_worn INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Outfits
CREATE TABLE public.generated_outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_ids UUID[],
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  weather_temp INTEGER,
  weather_condition TEXT,
  activity_type TEXT,
  accepted BOOLEAN DEFAULT false,
  worn BOOLEAN DEFAULT false
);

-- Outfit Posts
CREATE TABLE public.outfit_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  activity_context TEXT,
  visibility TEXT DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Item Tags
CREATE TABLE public.post_item_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES outfit_posts(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES wardrobe_items(id),
  item_name TEXT,
  source_url TEXT,
  x_pos DECIMAL,
  y_pos DECIMAL
);

-- Follows
CREATE TABLE public.follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Saved Posts
CREATE TABLE public.saved_posts (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES outfit_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Wishlist
CREATE TABLE public.wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source_post_id UUID REFERENCES outfit_posts(id),
  item_name TEXT,
  source_url TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Authentication

Supabase Auth with:
- Email + password
- Google OAuth
- Apple Sign In (required for iOS App Store)

On first sign in → onboarding flow.
On returning sign in → home screen directly.
Always fetch `public.profiles` after auth. If no profile exists, create one during onboarding.

---

## Outfit Generation

**Edge Function:** `generate-outfit`
**Model:** Gemini 1.5 Flash
**Trigger:** App open, once per day (cache result in `generated_outfits`)

**Prompt:**
```
You are a personal stylist. Given the user's wardrobe, today's weather, and their activity, suggest a complete outfit.

Weather: {temp}°F, {condition}, {precipitation_chance}% chance of rain
Activity: {activity_type}
Wardrobe: {JSON list of items with id, category, colors, tags}

Return ONLY valid JSON:
{
  "outfit": {
    "top": "<item_id>",
    "bottom": "<item_id>",
    "shoes": "<item_id>",
    "outerwear": "<item_id or null>",
    "accessory": "<item_id or null>"
  },
  "reasoning": "<one sentence why this works>"
}
```

---

## Weather Integration

```ts
// lib/weather.ts
export async function getWeather(lat: number, lng: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`
  const res = await fetch(url)
  const data = await res.json()
  return {
    temp: Math.round(data.current_weather.temperature),
    condition: mapWeatherCode(data.current_weather.weathercode),
    precipitation_chance: data.daily.precipitation_probability_max[0],
    high: Math.round(data.daily.temperature_2m_max[0]),
    low: Math.round(data.daily.temperature_2m_min[0]),
  }
}
```

Weather codes map to: Sunny / Partly Cloudy / Cloudy / Rainy / Snowy / Stormy

---

## AI Integration

```ts
// lib/gemini.ts — outfit generation
import { GoogleGenerativeAI } from '@google/generative-ai'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// lib/claude.ts — item parsing + style analysis
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
```

Use Claude for:
- Parsing product URLs into structured item data
- Analyzing onboarding style quiz answers
- Generating user style profile summaries

---

## Notifications

- **Morning outfit reminder:** 7:30 AM local time (user-configurable)
- Triggered by Supabase Edge Function cron
- Message: *"Your outfit for today is ready ☀️"*
- Social: new follower, like, comment, friend posted

---

## Screen List

```
Auth:
  /login
  /signup
  /onboarding/profile
  /onboarding/location
  /onboarding/style
  /onboarding/wardrobe

Main:
  / (home — daily outfit card)
  /wardrobe
  /wardrobe/add
  /wardrobe/[id]
  /feed
  /explore
  /post/new
  /profile
  /profile/[username]
  /post/[id]
  /settings
```

---

## Tab Navigation

```
Home  |  Wardrobe  |  + (post)  |  Feed  |  Profile
```

---

## V1 Scope

### In scope
- Onboarding (auth, profile, location, style quiz, first wardrobe items)
- Daily outfit generation (Gemini + weather + wardrobe)
- Outfit card (accept, swap, regenerate)
- Digital wardrobe (add via photo/URL/manual, grid, filter, edit)
- Post creation (photo, caption, item tags with x/y positioning)
- Friend feed (infinite scroll, like, save, comment)
- Explore tab (public posts grid)
- User profiles + follow/unfollow
- Push notifications (morning + social)
- Settings (account, notifications, privacy, dark mode)

### Out of scope
- In-app purchasing or checkout
- AI-generated photorealistic outfit renders
- Resale platform API integration
- Brand partnerships / sponsored content
- Outfit calendar / weekly planner
- Wear frequency analytics
- Video posts

---

## Code Conventions

- TypeScript everywhere — no `any` types
- All Supabase queries through typed client (`lib/supabase.ts`)
- React Query for all async data — no raw `useEffect` fetching
- Component files: PascalCase (`OutfitCard.tsx`)
- Hook files: camelCase with `use` prefix (`useOutfit.ts`)
- All colors and spacing via Tailwind tokens — no inline styles
- Every Supabase table must have RLS policies before use
- Edge Functions in TypeScript (Deno)
- All AI calls server-side only — never expose API keys to client

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
ANTHROPIC_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_VISION_API_KEY=

APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Getting Started

```bash
git clone https://github.com/yourname/drape.git
cd drape
npm install
npx supabase init
npx supabase start
npx supabase db push
cp .env.example .env.local
# fill in all keys
```

---

## Build Order — Claude Code Prompts

Use these in order:

```
1. "Read CLAUDE.md and scaffold the full monorepo structure with all folders,
    package.json files, and base config. Install all dependencies. Do not
    build any screens yet."

2. "Set up Supabase: create all migration files from the schema in CLAUDE.md,
    configure the typed client, and add RLS policies for every table."

3. "Build the auth flow: login, signup, and the full 4-step onboarding
    (profile → location → style quiz → add first wardrobe items)."

4. "Build the home screen: daily outfit card with weather display, activity
    selector, accept / swap / regenerate. Wire up the Gemini outfit
    generation edge function."

5. "Build the wardrobe tab: grid view with category filters, add item flow
    (photo + URL + manual), and item detail/edit screen."

6. "Build the post creation flow and the friend feed with infinite scroll,
    item tag overlay, like, save, and comment."

7. "Build explore tab, user profiles, follow/unfollow, and settings screen."

8. "Add push notifications: morning outfit reminder cron and social
    notification triggers."

9. "Final pass: dark mode, empty states, loading skeletons, error handling,
    and polish across all screens."
```
