import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isDemoMode) {
      // Demo Mode: Check local storage for persistent demo user session
      const storedDemoUser = localStorage.getItem('leadflow_demo_user');
      if (storedDemoUser) {
        try {
          const parsed = JSON.parse(storedDemoUser);
          setUser(parsed);
        } catch {
          // If parse fails, clear key
          localStorage.removeItem('leadflow_demo_user');
          setUser(null);
        }
      } else {
        // By default in demo mode, auto-create default sales agent session if first visit
        const defaultUser = {
          id: 'demo-agent-001',
          email: 'agent@krishatech.com',
          app_metadata: {},
          user_metadata: { name: 'Krisha Tech Sales Agent' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User;
        setUser(defaultUser);
        localStorage.setItem('leadflow_demo_user', JSON.stringify(defaultUser));
      }
      setLoading(false);
      return;
    }

    // Production Mode: Get current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for Auth changes in Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    if (isDemoMode) {
      const demoUser = {
        id: 'demo-agent-001',
        email: email.trim() || 'agent@krishatech.com',
        app_metadata: {},
        user_metadata: { name: 'Krisha Tech Sales Agent' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;

      setUser(demoUser);
      localStorage.setItem('leadflow_demo_user', JSON.stringify(demoUser));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '',
    });
    return { error };
  };

  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      localStorage.removeItem('leadflow_demo_user');
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemoMode,
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
