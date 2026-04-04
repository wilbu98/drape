import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { type, userId, data } = await req.json()

    // Fetch push token for user
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .single()

    if (!profile?.push_token) {
      return new Response(JSON.stringify({ skipped: 'no push token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const messages: Record<string, { title: string; body: string }> = {
      morning_outfit: { title: 'Drape', body: 'Your outfit for today is ready ☀️' },
      new_follower: { title: 'New follower', body: `${data?.username} started following you` },
      new_like: { title: 'New like', body: `${data?.username} liked your look` },
      new_comment: { title: 'New comment', body: `${data?.username}: ${data?.comment}` },
    }

    const notification = messages[type]
    if (!notification) throw new Error(`Unknown notification type: ${type}`)

    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: profile.push_token,
        title: notification.title,
        body: notification.body,
        sound: 'default',
      }),
    })

    const result = await expoRes.json()
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
