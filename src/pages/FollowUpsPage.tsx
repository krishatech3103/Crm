import React, { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { LeadCard } from '../components/leads/LeadCard';
import { LogCallModal } from '../components/leads/LogCallModal';
import { RescheduleModal } from '../components/leads/RescheduleModal';
import { CardSkeleton } from '../components/common/Skeleton';
import type { Lead } from '../types/lead';
import { getFollowUpCategory } from '../utils/date';
import { CalendarCheck, AlertCircle, Clock, Calendar } from 'lucide-react';

export const FollowUpsPage: React.FC = () => {
  const { leads, loading, refetch } = useLeads();
  const activeLeads = leads.filter((lead) => lead.status !== 'Won');

  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);
  const [selectedLeadForReschedule, setSelectedLeadForReschedule] = useState<Lead | null>(null);

  // Separate leads by follow-up category
  const overdueLeads = activeLeads.filter(l => getFollowUpCategory(l.follow_up_at) === 'overdue');
  const todayLeads = activeLeads.filter(l => getFollowUpCategory(l.follow_up_at) === 'today');
  const upcomingLeads = activeLeads.filter(l => getFollowUpCategory(l.follow_up_at) === 'upcoming');

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5 gradient-text">
          <CalendarCheck className="w-6 h-6 text-brand-400" />
          <span>Follow-up Pipeline</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
          Prioritized stream of leads categorized by urgency: Overdue, Due Today, and Upcoming.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Overdue Leads (High Priority) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-2.5">
              <div className="flex items-center gap-2 text-rose-300 font-extrabold">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base">Overdue Follow-ups</h3>
                <span className="text-xs font-bold bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 rounded-full shadow-sm text-rose-300 animate-pulse-subtle">
                  {overdueLeads.length}
                </span>
              </div>
            </div>

            {overdueLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
                {overdueLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onLogCall={(l) => setSelectedLeadForCall(l)}
                    onReschedule={(l) => setSelectedLeadForReschedule(l)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">No overdue follow-ups. All caught up! 🎉</p>
            )}
          </div>

          {/* Section 2: Today's Follow-ups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base">Scheduled for Today</h3>
                <span className="text-xs font-bold bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-sm text-amber-300">
                  {todayLeads.length}
                </span>
              </div>
            </div>

            {todayLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
                {todayLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onLogCall={(l) => setSelectedLeadForCall(l)}
                    onReschedule={(l) => setSelectedLeadForReschedule(l)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">No remaining follow-ups scheduled for today.</p>
            )}
          </div>

          {/* Section 3: Upcoming Follow-ups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-slate-200 font-extrabold">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base">Upcoming Schedule</h3>
                <span className="text-xs font-bold bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-slate-300">
                  {upcomingLeads.length}
                </span>
              </div>
            </div>

            {upcomingLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
                {upcomingLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onLogCall={(l) => setSelectedLeadForCall(l)}
                    onReschedule={(l) => setSelectedLeadForReschedule(l)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">No upcoming follow-ups scheduled.</p>
            )}
          </div>
        </div>
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
    </div>
  );
};
