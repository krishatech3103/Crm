import { useState, useEffect, useCallback } from 'react';
import type { LeadNote, NoteType } from '../types/lead';
import { supabase, isDemoMode } from '../lib/supabase';
import { initialMockNotes } from '../lib/mockData';

const LOCAL_NOTES_KEY = 'leadflow_notes_data';

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

    if (isDemoMode) {
      // LocalStorage Fallback Mode
      try {
        const stored = localStorage.getItem(LOCAL_NOTES_KEY);
        let allNotes: LeadNote[] = stored ? JSON.parse(stored) : initialMockNotes;
        const filtered = allNotes.filter((n) => n.lead_id === leadId);
        // Sort newest first
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setNotes(filtered);
      } catch (err: any) {
        setError(err.message || 'Failed to load local notes');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Production Supabase Mode
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

    if (isDemoMode) {
      try {
        const stored = localStorage.getItem(LOCAL_NOTES_KEY);
        let allNotes: LeadNote[] = stored ? JSON.parse(stored) : initialMockNotes;
        
        const createdNote: LeadNote = {
          ...newNoteObj,
          id: `note-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        allNotes.unshift(createdNote);
        localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(allNotes));
        
        if (targetLeadId === leadId) {
          setNotes((prev) => [createdNote, ...prev]);
        }
        return { note: createdNote, error: null };
      } catch (err: any) {
        return { note: null, error: err.message };
      }
    }

    // Production Supabase
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
