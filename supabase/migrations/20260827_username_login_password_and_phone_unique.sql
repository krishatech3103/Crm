-- Apply this migration in the Supabase SQL Editor before deploying the new
-- Edge Functions. It enables username sign-in and makes mobile numbers unique.

-- Keep the internal Supabase Auth email outside staff_profiles. No browser RLS
-- policy is created for this table; only trusted Edge Functions can read it.
CREATE TABLE IF NOT EXISTS public.staff_login_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  login_email TEXT NOT NULL UNIQUE
);

ALTER TABLE public.staff_login_accounts ENABLE ROW LEVEL SECURITY;

INSERT INTO public.staff_login_accounts (id, login_email)
SELECT id, email
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET login_email = EXCLUDED.login_email;

-- Future Auth accounts receive both their visible staff profile and their
-- private login mapping automatically.
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

  IF NEW.email IS NOT NULL THEN
    INSERT INTO public.staff_login_accounts (id, login_email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO UPDATE SET login_email = EXCLUDED.login_email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Usernames are case-insensitively unique because login is case-insensitive.
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_profiles_username_lower
  ON public.staff_profiles (lower(username));

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

-- Stop here and merge/delete conflicting records if normalized duplicates
-- already exist. This avoids silently changing or deleting CRM data.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.leads
    GROUP BY public.normalize_lead_phone(phone)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate lead phone numbers exist. Merge or remove those records, then run this migration again.';
  END IF;
END;
$$;

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone_normalized TEXT;
UPDATE public.leads
SET phone_normalized = public.normalize_lead_phone(phone)
WHERE phone_normalized IS DISTINCT FROM public.normalize_lead_phone(phone);

ALTER TABLE public.leads ALTER COLUMN phone_normalized SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_phone_normalized_unique
  ON public.leads (phone_normalized);

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
