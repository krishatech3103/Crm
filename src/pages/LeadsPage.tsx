import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLeads } from '../hooks/useLeads';
import { LeadCard } from '../components/leads/LeadCard';
import { LeadRow } from '../components/leads/LeadRow';
import { LogCallModal } from '../components/leads/LogCallModal';
import { RescheduleModal } from '../components/leads/RescheduleModal';
import { TableSkeleton, CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import type { Lead, LeadFilterState } from '../types/lead';
import { APP_CONFIG } from '../config/app.config';
import { Search, Filter, ArrowUpDown, Users, Plus } from 'lucide-react';
import { AddLeadModal } from '../components/leads/AddLeadModal';

export const LeadsPage: React.FC = () => {
  const { leads, loading, refetch, filterLeads } = useLeads();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterState, setFilterState] = useState<LeadFilterState>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    followUpFilter: (searchParams.get('followUp') as any) || 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Keep state in sync with URL search params if user navigated from Dashboard cards
  useEffect(() => {
    const statusFromUrl = searchParams.get('status') || 'all';
    const followUpFromUrl = searchParams.get('followUp') || 'all';
    setFilterState((prev) => ({
      ...prev,
      status: statusFromUrl,
      followUpFilter: followUpFromUrl as any,
    }));
  }, [searchParams]);

  const handleStatusFilterChange = (status: string) => {
    setFilterState((prev) => ({ ...prev, status }));
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const handleFollowUpFilterChange = (followUpFilter: LeadFilterState['followUpFilter']) => {
    setFilterState((prev) => ({ ...prev, followUpFilter }));
    if (followUpFilter === 'all') {
      searchParams.delete('followUp');
    } else {
      searchParams.set('followUp', followUpFilter);
    }
    setSearchParams(searchParams);
  };

  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);
  const [selectedLeadForReschedule, setSelectedLeadForReschedule] = useState<Lead | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  const filteredLeads = filterLeads(filterState);

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight gradient-text">
            Leads Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Search, filter, and track local business prospect leads.
          </p>
        </div>

        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Lead</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl space-y-4 border border-indigo-500/20 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, business, or phone..."
              value={filterState.search}
              onChange={(e) => setFilterState((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 placeholder:text-slate-600 shadow-inner"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <select
              value={filterState.status}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 shadow-inner font-medium"
            >
              <option value="all">All Statuses</option>
              {APP_CONFIG.statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Follow-up filter */}
          <select
            value={filterState.followUpFilter}
            onChange={(e) => handleFollowUpFilterChange(e.target.value as LeadFilterState['followUpFilter'])}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 shadow-inner font-medium"
          >
            <option value="all">All Follow-ups</option>
            <option value="overdue">⚠️ Overdue</option>
            <option value="today">📅 Due Today</option>
            <option value="upcoming">⏳ Upcoming</option>
            <option value="none">No Follow-up Set</option>
          </select>

          {/* Sort By */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <select
              value={`${filterState.sortBy}_${filterState.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_');
                setFilterState((prev) => ({
                  ...prev,
                  sortBy: sortBy as LeadFilterState['sortBy'],
                  sortOrder: sortOrder as LeadFilterState['sortOrder'],
                }));
              }}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 shadow-inner font-medium"
            >
              <option value="created_at_desc">Newest Added</option>
              <option value="follow_up_at_asc">Follow-up Date (Earliest)</option>
              <option value="last_contacted_at_desc">Recently Contacted</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Search summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span className="font-medium">
            Showing <strong className="text-white font-bold">{filteredLeads.length}</strong> of{' '}
            <strong className="text-white font-bold">{leads.length}</strong> total leads
          </span>
          {(filterState.search || filterState.status !== 'all' || filterState.followUpFilter !== 'all') && (
            <button
              onClick={() => {
                setFilterState({
                  search: '',
                  status: 'all',
                  followUpFilter: 'all',
                  sortBy: 'created_at',
                  sortOrder: 'desc',
                });
                setSearchParams({});
              }}
              className="text-brand-400 hover:text-brand-300 font-bold transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Directory Content */}
      {loading ? (
        <div className="space-y-4">
          <div className="hidden md:block">
            <TableSkeleton />
          </div>
          <div className="md:hidden grid grid-cols-1 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : filteredLeads.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block glass-panel rounded-3xl overflow-hidden border border-indigo-500/20 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="px-4 py-3.5">Lead & Business</th>
                  <th className="px-4 py-3.5">Phone</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Follow-up</th>
                  <th className="px-4 py-3.5">Last Contacted</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredLeads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    onLogCall={(l) => setSelectedLeadForCall(l)}
                    onReschedule={(l) => setSelectedLeadForReschedule(l)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden grid grid-cols-1 gap-4 animate-slide-up">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onLogCall={(l) => setSelectedLeadForCall(l)}
                onReschedule={(l) => setSelectedLeadForReschedule(l)}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No leads match your search"
          description="Try broadening your search term or clearing applied filters."
          actionLabel="+ Add New Lead"
          onAction={() => setIsAddLeadModalOpen(true)}
        />
      )}

      {/* Modals */}
      {selectedLeadForCall && (
        <LogCallModal
          isOpen={Boolean(selectedLeadForCall)}
          onClose={() => setSelectedLeadForCall(null)}
          lead={selectedLeadForCall}
          onSuccess={refetch}
        />
      )}

      {selectedLeadForReschedule && (
        <RescheduleModal
          isOpen={Boolean(selectedLeadForReschedule)}
          onClose={() => setSelectedLeadForReschedule(null)}
          lead={selectedLeadForReschedule}
          onSuccess={refetch}
        />
      )}

      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onLeadAdded={refetch}
      />
    </div>
  );
};
