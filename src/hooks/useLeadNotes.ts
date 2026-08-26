import { useState, useEffect, useCallback } from 'react';
import type { LeadNote, NoteType } from '../types/lead';
import { isSupabaseConfigured, supabase, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';

export function useLeadNotes(leadId?: string) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!leadId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setNotes([]);
      setError(SUPABASE_CONFIGURATION_ERROR);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setNotes(data as LeadNote[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load lead notes from Supabase');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Add new call note
  const addNote = async (
    targetLeadId: string,
    noteText: string,
    type: NoteType = 'Call'
  ): Promise<{ note: LeadNote | null; error: string | null }> => {
    const newNoteObj: Omit<LeadNote, 'id' | 'created_at'> = {
      lead_id: targetLeadId,
      note: noteText,
      type,
    };

    if (!isSupabaseConfigured) {
      return { note: null, error: SUPABASE_CONFIGURATION_ERROR };
    }

    try {
      const { data, error: insertErr } = await supabase
        .from('lead_notes')
        .insert([newNoteObj])
        .select()
        .single();

      if (insertErr) throw insertErr;
      const createdNote = data as LeadNote;

      if (targetLeadId === leadId) {
        setNotes((prev) => [createdNote, ...prev]);
      }
      return { note: createdNote, error: null };
    } catch (err: any) {
      return { note: null, error: err.message || 'Failed to add note' };
    }
  };

  return {
    notes,
    loading,
    error,
    refetch: fetchNotes,
    addNote,
  };
}
