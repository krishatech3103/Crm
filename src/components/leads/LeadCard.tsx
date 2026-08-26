import React from 'react';
import type { Lead } from '../../types/lead';
import { Badge } from '../common/Badge';
import { getWhatsAppUrl, getTelUrl } from '../../utils/phone';
import { formatDateTime, getFollowUpCategory } from '../../utils/date';
import { Phone, MessageSquare, Calendar, ChevronRight, ExternalLink, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LeadCardProps {
  lead: Lead;
  onLogCall: (lead: Lead) => void;
  onReschedule: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onLogCall,
  onReschedule,
}) => {
  const followUpCategory = getFollowUpCategory(lead.follow_up_at);
  const businessName = lead.business_name || lead.name;

  const detailsPath = lead.status === 'Won' ? `/clients/${lead.id}` : `/leads/${lead.id}`;

  return (
    <div className="rounded-2xl p-5 flex flex-col justify-between gap-4 text-left relative group bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-indigo-500/20 shadow-xl shadow-black/40 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/15 hover:-translate-y-1 transition-all duration-300">
      
      {/* 1. Header Row: Business & Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            to={detailsPath}
            className="font-extrabold text-base text-white hover:text-brand-300 transition-colors flex items-center gap-1 group/link truncate"
          >
            <span className="truncate">{businessName}</span>
            <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>

        <Badge status={lead.status} size="sm" className="shrink-0 shadow-sm" />
      </div>

      {/* 2. Contact Phone, Source & Category */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="bg-slate-950/80 border border-slate-800/90 px-3 py-1.5 rounded-xl font-mono text-slate-200 font-semibold shadow-inner">
          <span>{lead.phone}</span>
        </div>

        {lead.business_category && (
          <div className="flex items-center gap-1 text-[10px] font-bold tracking-wide text-violet-200 bg-violet-500/10 border border-violet-500/25 px-2.5 py-1 rounded-lg">
            <Tag className="w-3 h-3 text-violet-300" />
            <span>{lead.business_category}</span>
          </div>
        )}
        {lead.source && (
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg">
            <Tag className="w-3 h-3 text-indigo-400" />
            <span>{lead.source}</span>
          </div>
        )}
      </div>

      {/* 3. Dedicated Follow-up Schedule Banner */}
      {lead.follow_up_at && (
        <div
          onClick={() => onReschedule(lead)}
          className={`cursor-pointer p-3 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
            followUpCategory === 'overdue'
              ? 'bg-gradient-to-r from-rose-950/90 to-rose-900/40 border border-rose-500/40 text-rose-200 shadow-sm shadow-rose-500/10 hover:border-rose-400'
              : followUpCategory === 'today'
              ? 'bg-gradient-to-r from-amber-950/90 to-amber-900/40 border border-amber-500/40 text-amber-200 shadow-sm shadow-amber-500/10 hover:border-amber-400'
              : 'bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-indigo-500/40'
          }`}
          title="Click to reschedule follow-up"
        >
          <div className="flex items-center gap-1.5">
            <Calendar className={`w-4 h-4 shrink-0 ${
              followUpCategory === 'overdue' ? 'text-rose-400 animate-pulse' : followUpCategory === 'today' ? 'text-amber-400' : 'text-indigo-400'
            }`} />
            <span className="text-slate-400 text-[11px]">Follow-up:</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-extrabold text-xs">
              {followUpCategory === 'overdue' && '⚠️ '}
              {formatDateTime(lead.follow_up_at)}
            </span>
          </div>
        </div>
      )}

      {/* 4. Vibrant High-Contrast Action Buttons Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        {/* Direct Call Button */}
        <a
          href={getTelUrl(lead.phone)}
          onClick={() => onLogCall(lead)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-indigo-600 via-brand-600 to-indigo-700 hover:from-indigo-500 hover:to-brand-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/30 border border-indigo-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call</span>
        </a>

        {/* WhatsApp Button */}
        <a
          href={getWhatsAppUrl(lead.phone, `Hi ${businessName}, touching base from Krisha Tech regarding web development & digital services...`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 border border-emerald-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        {/* Open Details Page Button */}
        <Link
          to={detailsPath}
          className="p-2.5 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 rounded-xl border border-slate-700/80 transition-colors shrink-0 shadow-sm"
          title="View Lead Profile"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
