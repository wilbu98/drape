import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { wardrobe, weather, activity } = await req.json()

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a personal stylist. Given the user's wardrobe, today's weather, and their activity, suggest a complete outfit.

Weather: ${weather.temp}°F, ${weather.condition}, ${weather.precipitation_chance}% chance of rain
Activity: ${activity}
Wardrobe: ${JSON.stringify(wardrobe.map((item: any) => ({ id: item.id, category: item.category, colors: item.colors, tags: item.tags, name: item.name })))}

Return ONLY valid JSON:
{
  "outfit": {
    "top": "<item_id or null>",
    "bottom": "<item_id or null>",
    "shoes": "<item_id or null>",
    "outerwear": "<item_id or null>",
    "accessory": "<item_id or null>"
  },
  "reasoning": "<one sentence why this works>"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const outfit = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify(outfit), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
