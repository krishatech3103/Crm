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
  const authorization = request.headers.get('Authorization');
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !authorization) return json({ error: 'Unauthorized.' }, 401);

  const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !caller) return json({ error: 'Unauthorized.' }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: callerProfile } = await adminClient
    .from('staff_profiles')
    .select('role')
    .eq('id', caller.id)
    .maybeSingle();
  if (callerProfile?.role !== 'admin') return json({ error: 'Only administrators can reset staff passwords.' }, 403);

  let payload: { userId?: unknown; temporaryPassword?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }
  const userId = typeof payload.userId === 'string' ? payload.userId : '';
  const password = typeof payload.temporaryPassword === 'string' ? payload.temporaryPassword : '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) return json({ error: 'Invalid staff member.' }, 400);
  if (password.length < 8) return json({ error: 'Temporary password must be at least 8 characters.' }, 400);

  const { data: targetProfile } = await adminClient
    .from('staff_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  if (!targetProfile) return json({ error: 'Staff member not found.' }, 404);

  const { error: passwordError } = await adminClient.auth.admin.updateUserById(userId, { password });
  if (passwordError) return json({ error: passwordError.message || 'Unable to update password.' }, 400);

  const { error: profileError } = await adminClient
    .from('staff_profiles')
    .update({ must_change_password: true })
    .eq('id', userId);
  if (profileError) return json({ error: 'Password changed, but the first-login rule could not be applied.' }, 500);

  return json({ success: true }, 200);
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
