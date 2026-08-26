import React, { useState, useEffect } from 'react';
import type { TeamMember, AgencySettings } from '../types/user';
import { AddUserModal } from '../components/settings/AddUserModal';
import { useToast } from '../context/ToastContext';
import { APP_CONFIG } from '../config/app.config';
import { isDemoMode } from '../lib/supabase';
import { Users, UserPlus, Settings as SettingsIcon, Building, MessageSquare, Database, ShieldCheck, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'usr_001',
    name: 'Sandip Pujari',
    email: 'sandip@krishatech.com',
    role: 'Admin',
    phone: '+91 70833 30914',
    status: 'Active',
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'usr_002',
    name: 'Sales Agent (Demo)',
    email: 'agent@krishatech.com',
    role: 'Sales Agent',
    phone: '+91 98220 12345',
    status: 'Active',
    created_at: '2026-02-01T10:30:00Z',
  },
  {
    id: 'usr_003',
    name: 'Priya Sharma',
    email: 'priya@krishatech.com',
    role: 'Sales Manager',
    phone: '+91 91580 98765',
    status: 'Active',
    created_at: '2026-03-10T14:15:00Z',
  },
];

const INITIAL_AGENCY_SETTINGS: AgencySettings = {
  companyName: APP_CONFIG.company,
  supportPhone: '+91 70833 30914',
  defaultWhatsAppMessage: `Hi {lead_name}, touching base from Krisha Tech regarding web development & digital services for {business_name}...`,
  leadSources: ['Cold Call', 'Google Business', 'Instagram', 'Referral', 'Website Form'],
};

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'agency' | 'system'>('users');

  // Team Members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('krisha_crm_team');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TEAM;
      }
    }
    return INITIAL_TEAM;
  });

  // Agency Settings state
  const [agencySettings, setAgencySettings] = useState<AgencySettings>(() => {
    const saved = localStorage.getItem('krisha_crm_agency_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_AGENCY_SETTINGS;
      }
    }
    return INITIAL_AGENCY_SETTINGS;
  });

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Save team members to localStorage
  useEffect(() => {
    localStorage.setItem('krisha_crm_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Save agency settings to localStorage
  const handleSaveAgencySettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('krisha_crm_agency_settings', JSON.stringify(agencySettings));
    showToast('Agency & CRM settings saved successfully!', 'success');
  };

  const handleUserAdded = (newUser: TeamMember) => {
    setTeamMembers((prev) => [newUser, ...prev]);
  };

  const handleToggleUserStatus = (id: string) => {
    setTeamMembers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
          : user
      )
    );
    showToast('User status updated', 'info');
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove team member "${name}"?`)) {
      setTeamMembers((prev) => prev.filter((u) => u.id !== id));
      showToast(`User ${name} removed`, 'info');
    }
  };

  const handleResetDemoData = () => {
    if (confirm('Reset all demo CRM data back to defaults? (Leads & call history will reload from mock set)')) {
      localStorage.removeItem('leadflow_leads_v1');
      localStorage.removeItem('krisha_crm_team');
      setTeamMembers(INITIAL_TEAM);
      showToast('Demo data reset to initial state. Please refresh page.', 'info');
    }
  };

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
            Manage agency staff access, lead source templates, and CRM preferences.
          </p>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] w-fit"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Team Member</span>
          </button>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-brand-600/30 to-violet-600/30 text-white border border-brand-500/40 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Team & Users ({teamMembers.length})</span>
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

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'system'
              ? 'bg-gradient-to-r from-brand-600/30 to-violet-600/30 text-white border border-brand-500/40 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>System & PWA Status</span>
        </button>
      </div>

      {/* TAB 1: Team & Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-slide-up">
          <div className="glass-panel rounded-3xl overflow-hidden border border-indigo-500/20 shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white">Staff & Sales Agent Directory</h3>
                <p className="text-xs text-slate-400">Team members with authorization to log into Krisha Tech CRM</p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                {teamMembers.filter((u) => u.status === 'Active').length} Active Staff
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-3.5">Member Name</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Phone</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        {member.name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-mono">
                        {member.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                            member.role === 'Admin'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : member.role === 'Sales Manager'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono">
                        {member.phone || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleUserStatus(member.id)}
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all ${
                            member.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {member.status === 'Active' ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(member.id, member.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Agency Preferences */}
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

      {/* TAB 3: System Telemetry */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-slide-up max-w-3xl">
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-indigo-500/20 shadow-xl">
            <h3 className="text-base font-extrabold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>System Storage & Infrastructure</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Database Architecture</p>
                <p className="text-white font-extrabold text-sm flex items-center gap-2">
                  {isDemoMode ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Demo Mode (LocalStorage)</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Supabase PostgreSQL Cloud</span>
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">PWA Offline Engine</p>
                <p className="text-emerald-300 font-extrabold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Service Worker Active</span>
                </p>
              </div>
            </div>

            {/* Reset Demo Data Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Reset Demo Storage Cache</p>
                <p className="text-[11px] text-slate-400">Restore standard mock leads and initial staff credentials</p>
              </div>

              <button
                onClick={handleResetDemoData}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
};
