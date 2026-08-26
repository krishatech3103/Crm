-- Apply this migration in the Supabase SQL Editor for existing deployments.
-- It adds username-based staff profiles, roles, the initial-password rule,
-- and database-level protection against lead deletion by salespeople.

CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'salesperson' CHECK (role IN ('admin', 'salesperson')),
    must_change_password BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_role ON public.staff_profiles(role);

CREATE OR REPLACE FUNCTION public.handle_new_staff_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.staff_profiles (id, username, role, must_change_password)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'username'), ''), 'staff-' || left(NEW.id::text, 8)),
    CASE WHEN lower(COALESCE(NEW.raw_app_meta_data ->> 'role', '')) = 'admin' THEN 'admin' ELSE 'salesperson' END,
    true
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created_staff_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_staff_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_staff_profile();

INSERT INTO public.staff_profiles (id, username, role, must_change_password)
SELECT
  users.id,
  COALESCE(NULLIF(trim(users.raw_user_meta_data ->> 'username'), ''), 'staff-' || left(users.id::text, 8)),
  CASE WHEN lower(COALESCE(users.raw_app_meta_data ->> 'role', '')) = 'admin' THEN 'admin' ELSE 'salesperson' END,
  true
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_staff_profiles_updated_at ON public.staff_profiles;
CREATE TRIGGER set_staff_profiles_updated_at
BEFORE UPDATE ON public.staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can select staff profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Users can select their own staff profile" ON public.staff_profiles;
CREATE POLICY "Users can select their own staff profile"
    ON public.staff_profiles FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update staff profiles" ON public.staff_profiles;
CREATE POLICY "Admins can update staff profiles"
    ON public.staff_profiles FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.clear_initial_password_requirement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.encrypted_password IS DISTINCT FROM OLD.encrypted_password THEN
    UPDATE public.staff_profiles
    SET must_change_password = false,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_password_changed ON auth.users;
CREATE TRIGGER on_auth_user_password_changed
AFTER UPDATE OF encrypted_password ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.clear_initial_password_requirement();

DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.leads;
CREATE POLICY "Only admins can delete leads"
    ON public.leads FOR DELETE TO authenticated
    USING (public.is_admin());

-- Bootstrap one administrator after applying the migration, replacing the
-- placeholder with that staff member's username:
-- UPDATE public.staff_profiles SET role = 'admin' WHERE username = 'your-admin-username';
