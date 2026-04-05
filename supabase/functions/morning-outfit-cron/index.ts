import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'

// This function is triggered via Supabase cron or an external scheduler.
// Schedule: every day at 7:30 AM UTC (adjust based on user timezones in production)
//
// To schedule in Supabase Dashboard:
//   SQL Editor → run:
//   select cron.schedule('morning-outfit', '30 7 * * *', $$
//     select net.http_post(
//       url := 'https://<project-ref>.supabase.co/functions/v1/morning-outfit-cron',
//       headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
//     )
//   $$);

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get all users with push tokens
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, push_token')
    .not('push_token', 'is', null)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const results = []

  for (const profile of profiles ?? []) {
    if (!profile.push_token) continue

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: profile.push_token,
        title: 'Drape',
        body: 'Your outfit for today is ready ☀️',
        sound: 'default',
        data: { screen: 'home' },
      }),
    })

    const result = await res.json()
    results.push({ userId: profile.id, result })
  }

  console.log(`Sent morning notifications to ${results.length} users`)

  return new Response(JSON.stringify({ sent: results.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
