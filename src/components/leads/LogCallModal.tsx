import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Lead, LeadStatus, NoteType } from '../../types/lead';
import { useLeads } from '../../hooks/useLeads';
import { useLeadNotes } from '../../hooks/useLeadNotes';
import { useToast } from '../../context/ToastContext';
import { APP_CONFIG } from '../../config/app.config';
import { PhoneCall, Calendar, MessageSquare, Check, Sparkles } from 'lucide-react';
import { toInputDateTimeLocal, getPresetDateISO } from '../../utils/date';

interface LogCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess?: () => void;
}

export const LogCallModal: React.FC<LogCallModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const { updateLead } = useLeads();
  const { addNote } = useLeadNotes(lead.id);
  const { showToast } = useToast();

  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('Call');
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [followUpAt, setFollowUpAt] = useState<string>(toInputDateTimeLocal(lead.follow_up_at));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePresetSelect = (presetKey: 'later_today' | 'tomorrow' | 'in_2_days' | 'next_week') => {
    const iso = getPresetDateISO(presetKey);
    setFollowUpAt(toInputDateTimeLocal(iso));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      showToast('Please enter call notes before saving', 'error');
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();
    
    let isoFollowUp: string | null = null;
    if (followUpAt) {
      isoFollowUp = new Date(followUpAt).toISOString();
    }

    // 1. Add Note
    const { error: noteError } = await addNote(lead.id, noteText, noteType);
    if (noteError) {
      showToast(`Error saving note: ${noteError}`, 'error');
      setIsSubmitting(false);
      return;
    }

    // 2. Update Lead (status, last_contacted_at, follow_up_at)
    const { error: leadError } = await updateLead(lead.id, {
      status,
      last_contacted_at: now,
      follow_up_at: isoFollowUp,
    });

    setIsSubmitting(false);

    if (leadError) {
      showToast(`Note saved but lead update failed: ${leadError}`, 'error');
    } else {
      showToast('Call logged & lead updated successfully!', 'success');
      setNoteText('');
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Activity for ${lead.name}`}
      subtitle={lead.business_name || lead.phone}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Activity Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Activity Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {APP_CONFIG.noteTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setNoteType(t.value as NoteType)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium border transition-all ${
                  noteType === t.value
                    ? 'bg-brand-500/15 border-brand-500 text-brand-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.value === 'Call' && <PhoneCall className="w-4 h-4 mb-1" />}
                {t.value === 'WhatsApp' && <MessageSquare className="w-4 h-4 mb-1" />}
                {t.value === 'General' && <Sparkles className="w-4 h-4 mb-1" />}
                {t.value === 'Meeting' && <Check className="w-4 h-4 mb-1" />}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note Text area */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Notes / Outcome <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="e.g. Owner interested in 5-page static site with WhatsApp button. Asked to follow up tomorrow 4 PM."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-slate-600 transition-all resize-none"
          />
        </div>

        {/* Outcome Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Update Lead Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
          >
            {APP_CONFIG.statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Next Follow-up Date & Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Schedule Next Follow-up
          </label>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <button
              type="button"
              onClick={() => handlePresetSelect('later_today')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              Later Today
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('tomorrow')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('in_2_days')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              +2 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('next_week')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              Next Week
            </button>
          </div>

          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="datetime-local"
              value={followUpAt}
              onChange={(e) => setFollowUpAt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Modal footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-lg shadow-brand-600/25 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Activity'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
