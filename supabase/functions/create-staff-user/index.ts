import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type UserRole = 'admin' | 'salesperson';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = request.headers.get('Authorization');
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !authorization) return json({ error: 'Unauthorized.' }, 401);

  // Verify the caller with the public key and their supplied JWT. The service
  // role key is reserved for the server-only administrative work below.
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
  if (callerProfile?.role !== 'admin') return json({ error: 'Only administrators can create staff users.' }, 403);

  let payload: { username?: unknown; temporaryPassword?: unknown; role?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const username = typeof payload.username === 'string' ? payload.username.trim() : '';
  const password = typeof payload.temporaryPassword === 'string' ? payload.temporaryPassword : '';
  const role: UserRole = payload.role === 'admin' ? 'admin' : 'salesperson';
  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) return json({ error: 'Username must be 3–50 characters and may contain letters, numbers, dots, underscores, or hyphens.' }, 400);
  if (password.length < 8) return json({ error: 'Temporary password must be at least 8 characters.' }, 400);

  const { data: existingProfile } = await adminClient
    .from('staff_profiles')
    .select('id')
    .ilike('username', username)
    .maybeSingle();
  if (existingProfile) return json({ error: 'That username is already in use.' }, 409);

  // Supabase Auth uses an email/password credential internally. This generated
  // address is private and is never returned to or displayed in the CRM; staff
  // sign in with their username through the dedicated login function.
  const internalEmail = `${username.toLowerCase()}@users.krishatech.invalid`;

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: internalEmail,
    password,
    email_confirm: true,
    user_metadata: { username },
    app_metadata: { role },
  });
  if (createError || !created.user) return json({ error: createError?.message || 'Unable to create the authentication account.' }, 400);

  const { data: staffMember, error: profileError } = await adminClient
    .from('staff_profiles')
    .update({ username, role, must_change_password: true })
    .eq('id', created.user.id)
    .select('id, username, role, must_change_password, created_at, updated_at')
    .single();

  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return json({ error: 'Unable to create the staff profile. No account was created.' }, 500);
  }

  return json({ staffMember }, 201);
});

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
