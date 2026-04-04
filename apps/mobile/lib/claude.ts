// Claude is called server-side only via Supabase Edge Functions.
// This file is a typed client for calling those functions from mobile.
import { supabase } from './supabase'

export interface ParsedItem {
  name: string
  brand: string | null
  category: string
  subcategory: string | null
  colors: string[]
  purchase_url: string
}

export async function parseItemUrl(url: string): Promise<ParsedItem> {
  const { data, error } = await supabase.functions.invoke('parse-item-url', {
    body: { url },
  })
  if (error) throw error
  return data as ParsedItem
}
