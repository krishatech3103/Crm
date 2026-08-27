import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Lead, LeadFilterState, LeadFormData, LeadStatus } from '../types/lead';
import { isSupabaseConfigured, supabase, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';
import { normalizePhoneNumber } from '../utils/phone';
import { getFollowUpCategory } from '../utils/date';
import { useAuth } from './AuthContext';

interface LeadsContextValue {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  checkDuplicatePhone: (phone: string, excludeId?: string) => Lead | null;
  addLead: (formData: LeadFormData) => Promise<{ lead: Lead | null; error: string | null }>;
  updateLead: (id: string, updates: Partial<Omit<Lead, 'id' | 'created_at'>>) => Promise<{ error: string | null }>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<{ error: string | null }>;
  updateFollowUpDate: (id: string, followUpAt: string | null) => Promise<{ error: string | null }>;
  deleteLead: (id: string) => Promise<{ error: string | null }>;
  filterLeads: (filters: LeadFilterState, collection?: Lead[]) => Lead[];
}

const LeadsContext = createContext<LeadsContextValue | undefined>(undefined);

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!user) {
      setLeads([]);
      setError(null);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setLeads([]);
      setError(SUPABASE_CONFIGURATION_ERROR);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('id, created_at, updated_at, created_by, name, phone, business_name, business_category, status, follow_up_at, address, google_business_url, instagram_url, website_url, source, last_contacted_at')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLeads((data || []) as Lead[]);
    } catch (fetchError: unknown) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch leads from Supabase');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const checkDuplicatePhone = useCallback((phone: string, excludeId?: string): Lead | null => {
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) return null;
    return leads.find((lead) => lead.id !== excludeId && normalizePhoneNumber(lead.phone) === normalizedPhone) || null;
  }, [leads]);

  const addLead = useCallback(async (formData: LeadFormData): Promise<{ lead: Lead | null; error: string | null }> => {
    if (!isSupabaseConfigured) return { lead: null, error: SUPABASE_CONFIGURATION_ERROR };

    const businessName = formData.business_name?.trim() || formData.name.trim();
    const newLeadData = {
      name: businessName,
      phone: formData.phone.trim(),
      business_name: businessName || null,
      business_category: formData.business_category?.trim() || null,
      status: formData.status || 'New',
      follow_up_at: formData.follow_up_at ? new Date(formData.follow_up_at).toISOString() : null,
      address: formData.address?.trim() || null,
      google_business_url: formData.google_business_url?.trim() || null,
      instagram_url: formData.instagram_url?.trim() || null,
      website_url: formData.website_url?.trim() || null,
      source: formData.source?.trim() || 'Google',
    };

    try {
      const { data, error: insertError } = await supabase.from('leads').insert(newLeadData).select().single();
      if (insertError) throw insertError;
      const createdLead = data as Lead;
      setLeads((current) => [createdLead, ...current]);
      return { lead: createdLead, error: null };
    } catch (insertError: unknown) {
      const databaseError = insertError as { code?: string; message?: string };
      if (databaseError.code === '23505' || databaseError.message?.includes('idx_leads_phone_normalized_unique')) {
        return { lead: null, error: 'A lead with this mobile number already exists.' };
      }
      return { lead: null, error: databaseError.message || 'Failed to create lead' };
    }
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Omit<Lead, 'id' | 'created_at'>>): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: SUPABASE_CONFIGURATION_ERROR };

    const updatedFields = { ...updates, updated_at: new Date().toISOString() };
    try {
      const { error: updateError } = await supabase.from('leads').update(updatedFields).eq('id', id);
      if (updateError) throw updateError;
      setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...updatedFields } : lead));
      return { error: null };
    } catch (updateError: unknown) {
      const databaseError = updateError as { code?: string; message?: string };
      if (databaseError.code === '23505' || databaseError.message?.includes('idx_leads_phone_normalized_unique')) {
        return { error: 'A lead with this mobile number already exists.' };
      }
      return { error: databaseError.message || 'Failed to update lead' };
    }
  }, []);

  const updateLeadStatus = useCallback((id: string, status: LeadStatus) => updateLead(id, { status }), [updateLead]);
  const updateFollowUpDate = useCallback((id: string, followUpAt: string | null) => updateLead(id, { follow_up_at: followUpAt }), [updateLead]);

  const deleteLead = useCallback(async (id: string): Promise<{ error: string | null }> => {
    if (role !== 'admin') return { error: 'Only administrators can delete leads.' };
    if (!isSupabaseConfigured) return { error: SUPABASE_CONFIGURATION_ERROR };

    try {
      const { error: deleteError } = await supabase.from('leads').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setLeads((current) => current.filter((lead) => lead.id !== id));
      return { error: null };
    } catch (deleteError: unknown) {
      return { error: deleteError instanceof Error ? deleteError.message : 'Failed to delete lead' };
    }
  }, [role]);

  const filterLeads = useCallback((filters: LeadFilterState, collection: Lead[] = leads): Lead[] => collection
    .filter((lead) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!(lead.business_name || lead.name).toLowerCase().includes(query) && !lead.phone.includes(query)) return false;
      }
      if (filters.status !== 'all' && lead.status !== filters.status) return false;
      if (filters.followUpFilter !== 'all') {
        const category = getFollowUpCategory(lead.follow_up_at);
        if (filters.followUpFilter === 'none' ? Boolean(lead.follow_up_at) : category !== filters.followUpFilter) return false;
      }
      return true;
    })
    .sort((first, second) => {
      const time = (lead: Lead, field: 'created_at' | 'follow_up_at' | 'last_contacted_at') => lead[field] ? new Date(lead[field] as string).getTime() : 0;
      const comparison = filters.sortBy === 'name'
        ? (first.business_name || first.name).localeCompare(second.business_name || second.name)
        : time(first, filters.sortBy) - time(second, filters.sortBy);
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    }), [leads]);

  const value = useMemo<LeadsContextValue>(() => ({
    leads, loading, error, refetch: fetchLeads, checkDuplicatePhone, addLead, updateLead,
    updateLeadStatus, updateFollowUpDate, deleteLead, filterLeads,
  }), [leads, loading, error, fetchLeads, checkDuplicatePhone, addLead, updateLead, updateLeadStatus, updateFollowUpDate, deleteLead, filterLeads]);

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
};

export function useLeadsContext() {
  const context = useContext(LeadsContext);
  if (!context) throw new Error('useLeads must be used within LeadsProvider.');
  return context;
}
