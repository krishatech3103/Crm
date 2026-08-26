import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';
import type { BusinessCategory } from '../types/businessCategory';

export function useBusinessCategories() {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!isSupabaseConfigured) {
      setCategories([]);
      setError(SUPABASE_CONFIGURATION_ERROR);
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('business_categories')
      .select('id, name, created_at')
      .order('name', { ascending: true });

    if (fetchError) setError(fetchError.message || 'Unable to load categories.');
    else setCategories((data || []) as BusinessCategory[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const addCategory = async (name: string): Promise<{ error: string | null }> => {
    const trimmedName = name.trim();
    if (!trimmedName) return { error: 'Category name is required.' };
    if (!isSupabaseConfigured) return { error: SUPABASE_CONFIGURATION_ERROR };

    const { data, error: insertError } = await supabase
      .from('business_categories')
      .insert({ name: trimmedName })
      .select('id, name, created_at')
      .single();

    if (insertError) return { error: insertError.message || 'Unable to add category.' };
    setCategories((current) => [...current, data as BusinessCategory].sort((a, b) => a.name.localeCompare(b.name)));
    return { error: null };
  };

  const deleteCategory = async (id: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return { error: SUPABASE_CONFIGURATION_ERROR };

    const { error: deleteError } = await supabase.from('business_categories').delete().eq('id', id);
    if (deleteError) return { error: deleteError.message || 'Unable to delete category.' };
    setCategories((current) => current.filter((category) => category.id !== id));
    return { error: null };
  };

  return { categories, loading, error, refetch, addCategory, deleteCategory };
}
