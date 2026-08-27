import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';
import type { StaffProfile, UserRole } from '../types/staff';

export interface CreateStaffMemberInput {
  username: string;
  temporaryPassword: string;
  role: UserRole;
}

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

  const createStaffMember = async (
    input: CreateStaffMemberInput,
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: SUPABASE_CONFIGURATION_ERROR };

    const { data, error: createError } = await supabase.functions.invoke('create-staff-user', {
      body: input,
    });

    if (createError) {
      const response = (createError as { context?: Response }).context;
      const responseBody = response
        ? (await response.clone().json().catch(() => null)) as { error?: unknown } | null
        : null;
      const message = typeof responseBody?.error === 'string'
        ? responseBody.error
        : createError.message || 'Unable to create staff user.';
      return { error: message };
    }
    if (!data?.staffMember) return { error: 'The staff user was not created.' };

    setStaffMembers((current) => [...current, data.staffMember as StaffProfile]
      .sort((a, b) => a.username.localeCompare(b.username)));
    return { error: null };
  };

  const resetStaffPassword = async (
    id: string,
    temporaryPassword: string,
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: SUPABASE_CONFIGURATION_ERROR };

    const { error: resetError } = await supabase.functions.invoke('update-staff-password', {
      body: { userId: id, temporaryPassword },
    });

    if (!resetError) {
      setStaffMembers((current) => current.map((member) => member.id === id
        ? { ...member, must_change_password: true }
        : member));
      return { error: null };
    }

    const response = (resetError as { context?: Response }).context;
    const responseBody = response
      ? (await response.clone().json().catch(() => null)) as { error?: unknown } | null
      : null;
    return {
      error: typeof responseBody?.error === 'string'
        ? responseBody.error
        : resetError.message || 'Unable to reset the password.',
    };
  };

  return { staffMembers, loading, error, refetch, updateStaffMember, createStaffMember, resetStaffPassword };
}
