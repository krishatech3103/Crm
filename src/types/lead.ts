export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Demo Sent'
  | 'Follow-up'
  | 'Won'
  | 'Not Interested';

export type NoteType = 'Call' | 'WhatsApp' | 'General' | 'Meeting';

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  name: string;
  phone: string;
  business_name?: string | null;
  business_category?: string | null;
  status: LeadStatus;
  follow_up_at?: string | null;
  address?: string | null;
  google_business_url?: string | null;
  instagram_url?: string | null;
  website_url?: string | null;
  source?: string | null;
  last_contacted_at?: string | null;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  created_by?: string | null;
  created_at: string;
  note: string;
  type: NoteType;
}

export interface LeadFormData {
  name: string;
  phone: string;
  business_name?: string;
  business_category?: string;
  status?: LeadStatus;
  follow_up_at?: string | null;
  address?: string;
  google_business_url?: string;
  instagram_url?: string;
  website_url?: string;
  source?: string;
}

export interface LogCallFormData {
  note: string;
  type: NoteType;
  status: LeadStatus;
  follow_up_at?: string | null;
}

export interface LeadFilterState {
  search: string;
  status: string;
  followUpFilter: 'all' | 'overdue' | 'today' | 'upcoming' | 'none';
  sortBy: 'created_at' | 'follow_up_at' | 'last_contacted_at' | 'name';
  sortOrder: 'asc' | 'desc';
}
