import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) return json({ error: 'Authentication is unavailable.' }, 500);

  let payload: { username?: unknown; password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const username = typeof payload.username === 'string' ? payload.username.trim() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  if (!username || !password) return json({ error: 'Invalid username or password.' }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile } = await adminClient
    .from('staff_profiles')
    .select('id')
    .ilike('username', username)
    .maybeSingle();
  if (!profile) return json({ error: 'Invalid username or password.' }, 401);

  const { data: account } = await adminClient
    .from('staff_login_accounts')
    .select('login_email')
    .eq('id', profile.id)
    .maybeSingle();
  if (!account?.login_email) return json({ error: 'Invalid username or password.' }, 401);

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await authClient.auth.signInWithPassword({
    email: account.login_email,
    password,
  });
  if (error || !data.session) return json({ error: 'Invalid username or password.' }, 401);

  return json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  }, 200);
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
