import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';
import type { StaffProfile, UserRole } from '../types/staff';

export function useStaffProfiles() {
  const [staffMembers, setStaffMembers] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setStaffMembers([]);
      setError(SUPABASE_CONFIGURATION_ERROR);
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('staff_profiles')
      .select('id, username, role, must_change_password, created_at, updated_at')
      .order('username', { ascending: true });

    if (fetchError) {
      setError(fetchError.message || 'Unable to load staff members.');
    } else {
      setStaffMembers((data || []) as StaffProfile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateStaffMember = async (
    id: string,
    updates: Pick<StaffProfile, 'username' | 'role'>,
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: SUPABASE_CONFIGURATION_ERROR };

    const username = updates.username.trim();
    if (!username) return { error: 'Username is required.' };

    const { data, error: updateError } = await supabase
      .from('staff_profiles')
      .update({ username, role: updates.role as UserRole })
      .eq('id', id)
      .select('id, username, role, must_change_password, created_at, updated_at')
      .single();

    if (updateError) return { error: updateError.message || 'Unable to update staff member.' };

    setStaffMembers((current) => current.map((member) => member.id === id ? (data as StaffProfile) : member));
    return { error: null };
  };

  return { staffMembers, loading, error, refetch, updateStaffMember };
}
