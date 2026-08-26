import React from 'react';
import type { LeadNote } from '../../types/lead';
import { formatDateTime } from '../../utils/date';
import { PhoneCall, MessageSquare, Sparkles, Users, Clock } from 'lucide-react';

interface ActivityTimelineProps {
  notes: LeadNote[];
  createdDate?: string;
  loading?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  notes,
  createdDate,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-1/4" />
              <div className="h-12 bg-slate-800/60 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative pl-4 space-y-6 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {notes.map((note) => {
        const isCall = note.type === 'Call';
        const isWhatsApp = note.type === 'WhatsApp';
        const isMeeting = note.type === 'Meeting';

        return (
          <div key={note.id} className="relative flex items-start gap-4 group">
            {/* Timeline icon badge */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 shadow-md border ${
                isCall
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : isWhatsApp
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : isMeeting
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {isCall && <PhoneCall className="w-4 h-4" />}
              {isWhatsApp && <MessageSquare className="w-4 h-4" />}
              {isMeeting && <Users className="w-4 h-4" />}
              {!isCall && !isWhatsApp && !isMeeting && <Sparkles className="w-4 h-4" />}
            </div>

            {/* Content box */}
            <div className="flex-1 glass-card p-4 rounded-2xl text-left space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{note.type}</span>
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(note.created_at)}
                </span>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap pt-1 leading-relaxed">
                {note.note}
              </p>
            </div>
          </div>
        );
      })}

      {/* Creation Event */}
      {createdDate && (
        <div className="relative flex items-start gap-4">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 z-10">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 glass-card p-3 rounded-2xl text-left">
            <p className="text-xs font-medium text-slate-400">Lead Created</p>
            <p className="text-xs text-slate-500">{formatDateTime(createdDate)}</p>
          </div>
        </div>
      )}

      {notes.length === 0 && !createdDate && (
        <p className="text-xs text-slate-500 text-center py-4">No call notes recorded yet.</p>
      )}
    </div>
  );
};
