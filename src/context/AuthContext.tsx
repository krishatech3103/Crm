import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';
import type { StaffProfile, UserRole } from '../types/staff';

export type { UserRole } from '../types/staff';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole | null;
  staffProfile: StaffProfile | null;
  refreshStaffProfile: () => Promise<void>;
  login: (username: string, password?: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUserRole = (user: User | null): UserRole | null => {
  if (!user) return null;

  return typeof user.app_metadata.role === 'string' && user.app_metadata.role.toLowerCase() === 'admin'
    ? 'admin'
    : 'salesperson';
};

const getFallbackProfile = (user: User): StaffProfile => ({
  id: user.id,
  username: typeof user.user_metadata.username === 'string' && user.user_metadata.username.trim()
    ? user.user_metadata.username.trim()
    : 'Staff member',
  role: getUserRole(user) || 'salesperson',
  // Until the staff profile loads, never interrupt an existing session with a
  // password prompt based on a guess.
  must_change_password: false,
  created_at: '',
  updated_at: '',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);

  const loadStaffProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser || !isSupabaseConfigured) {
      setStaffProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('staff_profiles')
      .select('id, username, role, must_change_password, created_at, updated_at')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (error || !data) {
      // The fallback keeps older deployments usable until the schema migration
      // is applied, without ever exposing the authentication email in the UI.
      setStaffProfile(getFallbackProfile(currentUser));
      return;
    }

    setStaffProfile(data as StaffProfile);
  }, []);

  const refreshStaffProfile = useCallback(async () => {
    await loadStaffProfile(user);
  }, [loadStaffProfile, user]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      await loadStaffProfile(session?.user ?? null);
      setLoading(false);
    });

    // Keep this callback synchronous. Supabase advises against awaiting other
    // Supabase calls from inside an auth-state callback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      void loadStaffProfile(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadStaffProfile]);

  const login = async (username: string, password?: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured) {
      return { error: new Error(SUPABASE_CONFIGURATION_ERROR) };
    }

    const { data, error: loginError } = await supabase.functions.invoke('login-with-username', {
      body: { username: username.trim(), password: password || '' },
    });
    if (loginError) return { error: new Error('Login failed. Check your username and password.') };
    if (!data?.session?.access_token || !data.session.refresh_token) {
      return { error: new Error('Login failed. Check your username and password.') };
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    return { error: sessionError };
  };

  const logout = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role: staffProfile?.role ?? getUserRole(user),
        staffProfile,
        refreshStaffProfile,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
