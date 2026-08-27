-- LeadFlow CRM Database Schema and Row Level Security Setup
-- Execute this SQL script in your Supabase SQL Editor

-- 1. Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_normalized TEXT NOT NULL,
    business_name TEXT,
    business_category TEXT,
    status TEXT DEFAULT 'New'::text NOT NULL CHECK (status IN ('New', 'Contacted', 'Demo Sent', 'Follow-up', 'Not Interested', 'Won')),
    follow_up_at TIMESTAMP WITH TIME ZONE,
    address TEXT,
    google_business_url TEXT,
    instagram_url TEXT,
    website_url TEXT,
    source TEXT DEFAULT 'Google'::text CHECK (source IN ('Google', 'Instagram', 'Local')),
    last_contacted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create lead_notes table
CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    note TEXT NOT NULL,
    type TEXT DEFAULT 'Call'::text NOT NULL
);

-- 3. Create Performance & Duplicate Search Indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_phone_normalized_unique ON public.leads(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up_at ON public.leads(follow_up_at);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON public.lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON public.lead_notes(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for `leads` (Authenticated CRM users only)
CREATE POLICY "Authenticated users can select leads" 
    ON public.leads FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can insert leads" 
    ON public.leads FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads" 
    ON public.leads FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete leads" 
    ON public.leads FOR DELETE 
    TO authenticated 
    USING (true);

-- 6. RLS Policies for `lead_notes` (Authenticated CRM users only)
CREATE POLICY "Authenticated users can select notes" 
    ON public.lead_notes FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can insert notes" 
    ON public.lead_notes FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update notes" 
    ON public.lead_notes FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete notes" 
    ON public.lead_notes FOR DELETE 
    TO authenticated 
    USING (true);

-- 7. Trigger to automatically update updated_at timestamp on leads table
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;
CREATE TRIGGER set_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 8. Staff profiles, access roles, and first-login password enforcement
-- Authentication email addresses stay in Supabase Auth only. The application
-- exposes staff usernames from this table instead.
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'salesperson' CHECK (role IN ('admin', 'salesperson')),
    must_change_password BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_role ON public.staff_profiles(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_profiles_username_lower ON public.staff_profiles(lower(username));

-- The internal authentication address is intentionally not exposed through
-- staff_profiles. Username-based login functions read this server-only table.
CREATE TABLE IF NOT EXISTS public.staff_login_accounts (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    login_email TEXT NOT NULL UNIQUE
);

ALTER TABLE public.staff_login_accounts ENABLE ROW LEVEL SECURITY;

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
  )
  ON CONFLICT (id) DO NOTHING;
  IF NEW.email IS NOT NULL THEN
    INSERT INTO public.staff_login_accounts (id, login_email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO UPDATE SET login_email = EXCLUDED.login_email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created_staff_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_staff_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_staff_profile();

-- Create profiles for users that existed before this schema was applied.
INSERT INTO public.staff_profiles (id, username, role, must_change_password)
SELECT
  users.id,
  COALESCE(NULLIF(trim(users.raw_user_meta_data ->> 'username'), ''), 'staff-' || left(users.id::text, 8)),
  CASE WHEN lower(COALESCE(users.raw_app_meta_data ->> 'role', '')) = 'admin' THEN 'admin' ELSE 'salesperson' END,
  true
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staff_login_accounts (id, login_email)
SELECT id, email FROM auth.users WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET login_email = EXCLUDED.login_email;

DROP TRIGGER IF EXISTS set_staff_profiles_updated_at ON public.staff_profiles;
CREATE TRIGGER set_staff_profiles_updated_at
BEFORE UPDATE ON public.staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- This function is used inside RLS policies. SECURITY DEFINER avoids policy
-- recursion while keeping role checks in the database.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can select staff profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Users can select their own staff profile" ON public.staff_profiles;
CREATE POLICY "Users can select their own staff profile"
    ON public.staff_profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update staff profiles" ON public.staff_profiles;
CREATE POLICY "Admins can update staff profiles"
    ON public.staff_profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Do not trust a browser-side flag for first-login completion. The requirement
-- is cleared only by a trigger after Supabase changes the encrypted password.
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

-- Only admins can delete leads. All authenticated users may still view and
-- manage leads as requested.
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Only admins can delete leads" ON public.leads;
CREATE POLICY "Only admins can delete leads"
    ON public.leads FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Store and enforce normalized phone numbers to prevent duplicate leads even
-- when two users submit different formats at the same time.
CREATE OR REPLACE FUNCTION public.normalize_lead_phone(value TEXT)
RETURNS TEXT
IMMUTABLE
LANGUAGE sql
AS $$
  SELECT CASE
    WHEN length(regexp_replace(COALESCE(value, ''), '\D', '', 'g')) = 12
      AND left(regexp_replace(COALESCE(value, ''), '\D', '', 'g'), 2) = '91'
      THEN substring(regexp_replace(COALESCE(value, ''), '\D', '', 'g') FROM 3)
    ELSE regexp_replace(COALESCE(value, ''), '\D', '', 'g')
  END;
$$;

CREATE OR REPLACE FUNCTION public.set_lead_phone_normalized()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.phone_normalized := public.normalize_lead_phone(NEW.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_lead_phone_normalized ON public.leads;
CREATE TRIGGER set_lead_phone_normalized
BEFORE INSERT OR UPDATE OF phone ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.set_lead_phone_normalized();

-- 9. Business category master (admin managed)
CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_business_categories_name ON public.business_categories(name);
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can select business categories" ON public.business_categories;
CREATE POLICY "Authenticated users can select business categories"
    ON public.business_categories FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can insert business categories" ON public.business_categories;
CREATE POLICY "Admins can insert business categories"
    ON public.business_categories FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete business categories" ON public.business_categories;
CREATE POLICY "Admins can delete business categories"
    ON public.business_categories FOR DELETE
    TO authenticated
    USING (public.is_admin());
