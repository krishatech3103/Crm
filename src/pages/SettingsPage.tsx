import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { APP_CONFIG } from '../config/app.config';
import { useAuth } from '../context/AuthContext';
import { useStaffProfiles } from '../hooks/useStaffProfiles';
import { useBusinessCategories } from '../hooks/useBusinessCategories';
import { EditStaffMemberModal } from '../components/settings/EditStaffMemberModal';
import { CreateStaffMemberModal } from '../components/settings/CreateStaffMemberModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { StaffProfile } from '../types/staff';
import type { BusinessCategory } from '../types/businessCategory';
import { Settings as SettingsIcon, Building, MessageSquare, ShieldAlert, CheckCircle2, Users, Pencil, Tags, Plus, Trash2 } from 'lucide-react';

interface AgencySettings {
  companyName: string;
  supportPhone: string;
  defaultWhatsAppMessage: string;
}

const AGENCY_SETTINGS_STORAGE_KEY = 'krisha_crm_agency_settings_v2';

const EMPTY_AGENCY_SETTINGS: AgencySettings = {
  companyName: APP_CONFIG.company,
  supportPhone: '',
  defaultWhatsAppMessage: '',
};

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { role, user, refreshStaffProfile } = useAuth();
  const { staffMembers, loading: staffLoading, error: staffError, updateStaffMember, createStaffMember } = useStaffProfiles();
  const { categories, loading: categoriesLoading, error: categoriesError, addCategory, deleteCategory } = useBusinessCategories();
  const [activeTab, setActiveTab] = useState<'staff' | 'categories' | 'agency'>('staff');
  const [editingStaffMember, setEditingStaffMember] = useState<StaffProfile | null>(null);
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<BusinessCategory | null>(null);

  const [agencySettings, setAgencySettings] = useState<AgencySettings>(() => {
    const saved = localStorage.getItem(AGENCY_SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return EMPTY_AGENCY_SETTINGS;
      }
    }
    return EMPTY_AGENCY_SETTINGS;
  });

  const handleSaveAgencySettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(AGENCY_SETTINGS_STORAGE_KEY, JSON.stringify(agencySettings));
    showToast('Agency & CRM settings saved successfully!', 'success');
  };

  const handleSaveStaffMember = async (updates: Pick<StaffProfile, 'username' | 'role'>) => {
    if (!editingStaffMember) return { error: 'No staff member selected.' };
    const result = await updateStaffMember(editingStaffMember.id, updates);
    if (result.error) {
      showToast(`Unable to update staff member: ${result.error}`, 'error');
    } else {
      if (editingStaffMember.id === user?.id) await refreshStaffProfile();
      showToast('Staff member updated successfully.', 'success');
    }
    return result;
  };

  const handleCreateStaffMember = async (input: Parameters<typeof createStaffMember>[0]) => {
    const result = await createStaffMember(input);
    if (result.error) showToast(`Unable to create staff user: ${result.error}`, 'error');
    else showToast('Staff user created. They must change the temporary password at first login.', 'success');
    return result;
  };

  const handleAddCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await addCategory(categoryName);
    if (result.error) showToast(`Unable to add category: ${result.error}`, 'error');
    else {
      setCategoryName('');
      showToast('Business category added.', 'success');
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const result = await deleteCategory(categoryToDelete.id);
    if (result.error) showToast(`Unable to delete category: ${result.error}`, 'error');
    else showToast('Business category deleted.', 'success');
    setCategoryToDelete(null);
  };

  if (role !== 'admin') {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center px-4 text-center animate-fade-in">
        <div className="glass-panel w-full rounded-3xl border border-rose-500/25 p-8 shadow-2xl shadow-rose-950/20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
            <ShieldAlert className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-extrabold text-white">Unauthorized</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Settings are available to administrators only. Salespeople can continue to access all leads and follow-ups.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 gradient-text">
            <SettingsIcon className="w-6 h-6 text-brand-400" />
            <span>Settings & Administration</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Manage staff, business categories, and CRM preferences.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'staff'
              ? 'bg-gradient-to-r from-brand-600/30 to-violet-600/30 text-white border border-brand-500/40 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4 text-violet-300" />
          <span>Staff Members</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-gradient-to-r from-brand-600/30 to-violet-600/30 text-white border border-brand-500/40 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Tags className="w-4 h-4 text-amber-300" />
          <span>Business Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('agency')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'agency'
              ? 'bg-gradient-to-r from-brand-600/30 to-violet-600/30 text-white border border-brand-500/40 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building className="w-4 h-4 text-brand-400" />
          <span>Agency Preferences</span>
        </button>

      </div>

      {activeTab === 'staff' && (
        <div className="max-w-3xl animate-slide-up">
          <div className="glass-panel overflow-hidden rounded-3xl border border-indigo-500/20 shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-5">
              <div>
                <h3 className="flex items-center gap-2 text-base font-extrabold text-white">
                  <Users className="h-5 w-5 text-violet-300" /> Staff members
                </h3>
                <p className="mt-1 text-xs text-slate-400">Use usernames and assign only Admin or Salesperson access.</p>
              </div>
              <button
                onClick={() => setIsCreateStaffOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-500"
              >
                <Plus className="h-4 w-4" /> Add staff
              </button>
            </div>

            {staffLoading ? (
              <div className="p-6 text-sm text-slate-400">Loading staff members…</div>
            ) : staffError ? (
              <div className="p-6 text-sm text-rose-300">Unable to load staff members: {staffError}</div>
            ) : staffMembers.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No staff profiles found yet.</div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {staffMembers.map((staffMember) => (
                  <div key={staffMember.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{staffMember.username}</p>
                      <p className="mt-1 text-[11px] font-semibold capitalize text-slate-400">{staffMember.role}</p>
                    </div>
                    <button
                      onClick={() => setEditingStaffMember(staffMember)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/20"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="max-w-3xl animate-slide-up">
          <div className="glass-panel overflow-hidden rounded-3xl border border-indigo-500/20 shadow-xl">
            <div className="border-b border-slate-800 px-6 py-5">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-white">
                <Tags className="h-5 w-5 text-amber-300" /> Business categories
              </h3>
              <p className="mt-1 text-xs text-slate-400">Add the categories available when creating or editing leads.</p>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2 border-b border-slate-800 p-5">
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="e.g. Restaurant"
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
                required
              />
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-brand-500">
                <Plus className="h-4 w-4" /> Add
              </button>
            </form>

            {categoriesLoading ? (
              <div className="p-6 text-sm text-slate-400">Loading categories…</div>
            ) : categoriesError ? (
              <div className="p-6 text-sm text-rose-300">Unable to load categories: {categoriesError}</div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No categories added yet.</div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <p className="text-sm font-semibold text-white">{category.name}</p>
                    <button
                      onClick={() => setCategoryToDelete(category)}
                      className="rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                      title={`Delete ${category.name}`}
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agency Preferences */}
      {activeTab === 'agency' && (
        <form onSubmit={handleSaveAgencySettings} className="space-y-6 animate-slide-up">
          <div className="glass-panel p-6 rounded-3xl space-y-5 border border-indigo-500/20 shadow-xl max-w-3xl">
            <h3 className="text-base font-extrabold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-400" />
              <span>Krisha Tech Branding & Outreach</span>
            </h3>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Agency Brand Title
              </label>
              <input
                type="text"
                value={agencySettings.companyName}
                onChange={(e) => setAgencySettings((prev) => ({ ...prev, companyName: e.target.value }))}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 shadow-inner font-semibold"
              />
            </div>

            {/* Support Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Support Contact Phone
              </label>
              <input
                type="tel"
                value={agencySettings.supportPhone}
                onChange={(e) => setAgencySettings((prev) => ({ ...prev, supportPhone: e.target.value }))}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 shadow-inner font-mono"
              />
            </div>

            {/* Default WhatsApp Message Template */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Default WhatsApp Outreach Template</span>
                <span className="text-[10px] text-slate-500 font-mono">Variables: {"{lead_name}"}, {"{business_name}"}</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
                <textarea
                  rows={3}
                  value={agencySettings.defaultWhatsAppMessage}
                  onChange={(e) => setAgencySettings((prev) => ({ ...prev, defaultWhatsAppMessage: e.target.value }))}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 shadow-inner leading-relaxed"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </form>
      )}

      <EditStaffMemberModal
        staffMember={editingStaffMember}
        onClose={() => setEditingStaffMember(null)}
        onSave={handleSaveStaffMember}
      />
      <CreateStaffMemberModal
        isOpen={isCreateStaffOpen}
        onClose={() => setIsCreateStaffOpen(false)}
        onCreate={handleCreateStaffMember}
      />
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteCategory}
        title="Delete business category?"
        message={`Delete ${categoryToDelete?.name || 'this category'}? Existing leads will keep their saved category text.`}
        confirmText="Delete category"
        isDangerous
      />
    </div>
  );
};
