import { useState, useEffect, useCallback } from 'react';
import type { Lead, LeadFormData, LeadFilterState, LeadStatus } from '../types/lead';
import { isSupabaseConfigured, supabase, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';
import { normalizePhoneNumber } from '../utils/phone';
import { getFollowUpCategory } from '../utils/date';
import { useAuth } from '../context/AuthContext';

export function useLeads() {
  const { role } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setLeads([]);
      setError(SUPABASE_CONFIGURATION_ERROR);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setLeads(data as Lead[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads from Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Check duplicate phone number
  const checkDuplicatePhone = (phone: string, excludeId?: string): Lead | null => {
    const norm = normalizePhoneNumber(phone);
    if (!norm) return null;
    return (
      leads.find(
        (l) => l.id !== excludeId && normalizePhoneNumber(l.phone) === norm
      ) || null
    );
  };

  // Add a new Lead
  const addLead = async (
    formData: LeadFormData
  ): Promise<{ lead: Lead | null; error: string | null }> => {
    const businessName = formData.business_name?.trim() || formData.name.trim();
    const newLeadData = {
      // `name` remains required by the current database schema. The business
      // name is the CRM's primary lead identifier, so keep both columns aligned.
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

    if (!isSupabaseConfigured) {
      return { lead: null, error: SUPABASE_CONFIGURATION_ERROR };
    }

    try {
      const { data, error: insertErr } = await supabase
        .from('leads')
        .insert([newLeadData])
        .select()
        .single();

      if (insertErr) throw insertErr;
      const created = data as Lead;
      setLeads((prev) => [created, ...prev]);
      return { lead: created, error: null };
    } catch (err: any) {
      return { lead: null, error: err.message || 'Failed to create lead' };
    }
  };

  // Update existing Lead fields
  const updateLead = async (
    id: string,
    updates: Partial<Omit<Lead, 'id' | 'created_at'>>
  ): Promise<{ error: string | null }> => {
    const updatedFields = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      return { error: SUPABASE_CONFIGURATION_ERROR };
    }

    try {
      const { error: updateErr } = await supabase
        .from('leads')
        .update(updatedFields)
        .eq('id', id);

      if (updateErr) throw updateErr;

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updatedFields } : l))
      );
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to update lead' };
    }
  };

  // Quick helper: Update Lead status
  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    return updateLead(id, { status });
  };

  // Quick helper: Update Follow-up date
  const updateFollowUpDate = async (id: string, followUpAt: string | null) => {
    return updateLead(id, { follow_up_at: followUpAt });
  };

  // Delete lead
  const deleteLead = async (id: string): Promise<{ error: string | null }> => {
    if (role !== 'admin') {
      return { error: 'Only administrators can delete leads.' };
    }

    if (!isSupabaseConfigured) {
      return { error: SUPABASE_CONFIGURATION_ERROR };
    }

    try {
      const { error: deleteErr } = await supabase.from('leads').delete().eq('id', id);
      if (deleteErr) throw deleteErr;
      setLeads((prev) => prev.filter((l) => l.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to delete lead' };
    }
  };

  // Filtering & Sorting Helper
  const filterLeads = (filters: LeadFilterState, collection: Lead[] = leads): Lead[] => {
    return collection
      .filter((lead) => {
        // Search term check (Business Name, Phone)
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchBusiness = (lead.business_name || lead.name).toLowerCase().includes(q);
          const matchPhone = lead.phone.includes(q);
          if (!matchBusiness && !matchPhone) return false;
        }

        // Status check
        if (filters.status !== 'all' && lead.status !== filters.status) {
          return false;
        }

        // Follow-up category check
        if (filters.followUpFilter !== 'all') {
          const cat = getFollowUpCategory(lead.follow_up_at);
          if (filters.followUpFilter === 'none') {
            if (lead.follow_up_at) return false;
          } else if (cat !== filters.followUpFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (filters.sortBy === 'name') {
          comparison = (a.business_name || a.name).localeCompare(b.business_name || b.name);
        } else if (filters.sortBy === 'follow_up_at') {
          const timeA = a.follow_up_at ? new Date(a.follow_up_at).getTime() : 0;
          const timeB = b.follow_up_at ? new Date(b.follow_up_at).getTime() : 0;
          comparison = timeA - timeB;
        } else if (filters.sortBy === 'last_contacted_at') {
          const timeA = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0;
          const timeB = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0;
          comparison = timeA - timeB;
        } else {
          // created_at
          const timeA = new Date(a.created_at).getTime();
          const timeB = new Date(b.created_at).getTime();
          comparison = timeA - timeB;
        }

        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
  };

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    checkDuplicatePhone,
    addLead,
    updateLead,
    updateLeadStatus,
    updateFollowUpDate,
    deleteLead,
    filterLeads,
  };
}
