import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLeads } from '../hooks/useLeads';
import { LeadCard } from '../components/leads/LeadCard';
import { LogCallModal } from '../components/leads/LogCallModal';
import { RescheduleModal } from '../components/leads/RescheduleModal';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import type { Lead } from '../types/lead';
import { getFollowUpCategory } from '../utils/date';
import { Users, Clock, Sparkles, CheckCircle2, TrendingUp, ArrowRight, Zap, Target } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { leads, loading, refetch } = useLeads();
  const navigate = useNavigate();

  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);
  const [selectedLeadForReschedule, setSelectedLeadForReschedule] = useState<Lead | null>(null);

  // Compute Metrics
  const activeLeads = leads.filter((lead) => lead.status !== 'Won');
  const totalLeads = activeLeads.length;
  const newLeadsCount = activeLeads.filter(l => l.status === 'New').length;
  const demoSentCount = activeLeads.filter(l => l.status === 'Demo Sent').length;
  const clientCount = leads.filter(l => l.status === 'Won').length;

  // Filter Today's & Overdue follow-up leads
  const todaysFollowUps = activeLeads.filter(l => {
    const cat = getFollowUpCategory(l.follow_up_at);
    return cat === 'overdue' || cat === 'today';
  }).sort((a, b) => {
    const catA = getFollowUpCategory(a.follow_up_at);
    const catB = getFollowUpCategory(b.follow_up_at);
    if (catA === 'overdue' && catB !== 'overdue') return -1;
    if (catA !== 'overdue' && catB === 'overdue') return 1;
    const timeA = a.follow_up_at ? new Date(a.follow_up_at).getTime() : 0;
    const timeB = b.follow_up_at ? new Date(b.follow_up_at).getTime() : 0;
    return timeA - timeB;
  });

  const dueCount = todaysFollowUps.length;
  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Hero Welcome Banner for Krisha Tech */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 relative overflow-hidden bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-slate-950">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-600/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                Krisha Tech Sales Hub
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight gradient-text">
              Sales & Follow-up Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Track prospects, initiate one-tap WhatsApp messages, and resolve today's follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/leads"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 rounded-xl shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.02]"
            >
              <Users className="w-4 h-4" />
              <span>All Leads ({totalLeads})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Clickable Vibrant KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Leads */}
        <button
          onClick={() => navigate('/leads')}
          className="glass-card p-4 rounded-2xl border-l-4 border-l-brand-500 flex flex-col justify-between hover:glow-brand cursor-pointer text-left group hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-brand-300 transition-colors">
              Total Pipeline
            </span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{totalLeads}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center justify-between">
              <span>Active Database</span>
              <span className="text-brand-400 group-hover:translate-x-0.5 transition-transform">View →</span>
            </p>
          </div>
        </button>

        {/* Card 2: Due Today */}
        <button
          onClick={() => navigate('/followups')}
          className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500 flex flex-col justify-between hover:glow-amber cursor-pointer text-left group hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-300 transition-colors">
              Action Due
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">{dueCount}</p>
            <p className="text-[10px] text-amber-300/80 mt-0.5 font-medium flex items-center justify-between">
              <span>Overdue + Today</span>
              <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">View →</span>
            </p>
          </div>
        </button>

        {/* Card 3: New Leads */}
        <button
          onClick={() => navigate('/leads?status=New')}
          className="glass-card p-4 rounded-2xl border-l-4 border-l-indigo-500 flex flex-col justify-between cursor-pointer text-left group hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-indigo-300 transition-colors">
              New
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{newLeadsCount}</p>
            <p className="text-[10px] text-indigo-300/80 mt-0.5 font-medium flex items-center justify-between">
              <span>Awaiting Outreach</span>
              <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">Filter →</span>
            </p>
          </div>
        </button>

        {/* Card 4: Demo Sent */}
        <button
          onClick={() => navigate('/leads?status=Demo%20Sent')}
          className="glass-card p-4 rounded-2xl border-l-4 border-l-cyan-500 flex flex-col justify-between cursor-pointer text-left group hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
              Demo Sent
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{demoSentCount}</p>
            <p className="text-[10px] text-cyan-300/80 mt-0.5 font-medium flex items-center justify-between">
              <span>Demo shared</span>
              <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">Filter →</span>
            </p>
          </div>
        </button>

        {/* Card 5: Clients */}
        <button
          onClick={() => navigate('/clients')}
          className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500 flex flex-col justify-between hover:glow-emerald col-span-2 lg:col-span-1 cursor-pointer text-left group hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-300 transition-colors">
              Clients
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">{clientCount}</p>
            <p className="text-[10px] text-emerald-300/80 mt-0.5 font-medium flex items-center justify-between">
              <span>Won opportunities</span>
              <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">Filter →</span>
            </p>
          </div>
        </button>
      </div>

      {/* Main Section: Today's & Overdue Follow-ups */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Action Required Today & Overdue
            </h3>
            <span className="text-xs font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
              {dueCount} Leads
            </span>
          </div>
          <Link
            to="/followups"
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center gap-1"
          >
            <span>Full Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : todaysFollowUps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
            {todaysFollowUps.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onLogCall={(l) => setSelectedLeadForCall(l)}
                onReschedule={(l) => setSelectedLeadForReschedule(l)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="All caught up for today! 🎉"
            description="You have completed all scheduled contacts for today. Explore the leads directory or add new prospects."
          />
        )}
      </div>

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
