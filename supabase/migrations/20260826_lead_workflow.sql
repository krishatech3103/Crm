-- Apply after 20260826_staff_security.sql.
-- Standardises lead workflow fields and adds the business-category master.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS business_category TEXT;

-- Preserve existing leads while mapping retired statuses into the new workflow.
UPDATE public.leads
SET status = CASE status
  WHEN 'Interested' THEN 'Follow-up'
  WHEN 'Proposal Sent' THEN 'Demo Sent'
  WHEN 'Lost' THEN 'Not Interested'
  WHEN 'New' THEN 'New'
  WHEN 'Contacted' THEN 'Contacted'
  WHEN 'Demo Sent' THEN 'Demo Sent'
  WHEN 'Follow-up' THEN 'Follow-up'
  WHEN 'Not Interested' THEN 'Not Interested'
  WHEN 'Won' THEN 'Won'
  ELSE 'New'
END;

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('New', 'Contacted', 'Demo Sent', 'Follow-up', 'Not Interested', 'Won'));

UPDATE public.leads
SET source = CASE
  WHEN lower(COALESCE(source, '')) LIKE '%instagram%' THEN 'Instagram'
  WHEN lower(COALESCE(source, '')) LIKE '%google%' THEN 'Google'
  ELSE 'Local'
END;

ALTER TABLE public.leads ALTER COLUMN source SET DEFAULT 'Google';
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_source_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_source_check
  CHECK (source IN ('Google', 'Instagram', 'Local'));

CREATE TABLE IF NOT EXISTS public.business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_business_categories_name ON public.business_categories(name);
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can select business categories" ON public.business_categories;
CREATE POLICY "Authenticated users can select business categories"
  ON public.business_categories FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert business categories" ON public.business_categories;
CREATE POLICY "Admins can insert business categories"
  ON public.business_categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete business categories" ON public.business_categories;
CREATE POLICY "Admins can delete business categories"
  ON public.business_categories FOR DELETE TO authenticated
  USING (public.is_admin());
