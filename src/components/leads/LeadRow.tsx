import React from 'react';
import type { Lead } from '../../types/lead';
import { Badge } from '../common/Badge';
import { getWhatsAppUrl, getTelUrl } from '../../utils/phone';
import { formatDate, formatDateTime, getFollowUpCategory } from '../../utils/date';
import { Phone, MessageSquare, Calendar, ChevronRight, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LeadRowProps {
  lead: Lead;
  onLogCall: (lead: Lead) => void;
  onReschedule: (lead: Lead) => void;
}

export const LeadRow: React.FC<LeadRowProps> = ({
  lead,
  onLogCall,
  onReschedule,
}) => {
  const followUpCategory = getFollowUpCategory(lead.follow_up_at);
  const businessName = lead.business_name || lead.name;
  const detailsPath = lead.status === 'Won' ? `/clients/${lead.id}` : `/leads/${lead.id}`;

  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-800/50 transition-colors group">
      {/* Business Name */}
      <td className="px-4 py-3.5 text-left">
        <Link
          to={detailsPath}
          className="font-bold text-sm text-white hover:text-brand-300 transition-colors flex items-center gap-1.5"
        >
          <span>{businessName}</span>
          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </td>

      {/* Phone Number */}
      <td className="px-4 py-3.5 text-left">
        <div className="text-xs text-slate-300 font-mono font-medium">
          <span>{lead.phone}</span>
        </div>
      </td>

      {/* Status Badge */}
      <td className="px-4 py-3.5 text-left">
        <Badge status={lead.status} size="sm" />
      </td>

      {/* Follow-up Date */}
      <td className="px-4 py-3.5 text-left">
        {lead.follow_up_at ? (
          <button
            onClick={() => onReschedule(lead)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1 ${
              followUpCategory === 'overdue'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse-subtle'
                : followUpCategory === 'today'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            <Calendar className="w-3 h-3 shrink-0 text-indigo-400" />
            <span>{formatDate(lead.follow_up_at)}</span>
          </button>
        ) : (
          <button
            onClick={() => onReschedule(lead)}
            className="text-xs text-slate-500 hover:text-indigo-400 transition-colors font-medium"
          >
            + Set Date
          </button>
        )}
      </td>

      {/* Last Contacted */}
      <td className="px-4 py-3.5 text-left text-xs text-slate-400">
        {lead.last_contacted_at ? formatDateTime(lead.last_contacted_at) : 'Never'}
      </td>

      {/* Quick Actions */}
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Call action */}
          <a
            href={getTelUrl(lead.phone)}
            onClick={() => onLogCall(lead)}
            className="p-1.5 text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/30"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>

          {/* WhatsApp action */}
          <a
            href={getWhatsAppUrl(lead.phone, `Hi ${businessName}, regarding web development from Krisha Tech...`)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/30"
            title="Open WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>

          {/* Log Call Modal Trigger */}
          <button
            onClick={() => onLogCall(lead)}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-indigo-600/30 text-indigo-200 hover:text-white rounded-lg transition-all border border-indigo-500/20 flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3 text-indigo-400" />
            <span>Log Call</span>
          </button>
        </div>
      </td>
    </tr>
  );
};
