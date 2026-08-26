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
    business_name TEXT,
    status TEXT DEFAULT 'New'::text NOT NULL,
    follow_up_at TIMESTAMP WITH TIME ZONE,
    address TEXT,
    google_business_url TEXT,
    instagram_url TEXT,
    website_url TEXT,
    source TEXT,
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
