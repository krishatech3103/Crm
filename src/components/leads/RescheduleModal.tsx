import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Lead } from '../../types/lead';
import { useLeads } from '../../hooks/useLeads';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, Check } from 'lucide-react';
import { getPresetDateISO, toInputDateTimeLocal } from '../../utils/date';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess?: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const { updateFollowUpDate } = useLeads();
  const { showToast } = useToast();

  const [followUpAt, setFollowUpAt] = useState<string>(toInputDateTimeLocal(lead.follow_up_at));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePresetSelect = (presetKey: 'later_today' | 'tomorrow' | 'in_2_days' | 'next_week') => {
    const iso = getPresetDateISO(presetKey);
    setFollowUpAt(toInputDateTimeLocal(iso));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let isoDate: string | null = null;
    if (followUpAt) {
      isoDate = new Date(followUpAt).toISOString();
    }

    const { error } = await updateFollowUpDate(lead.id, isoDate);
    setIsSubmitting(false);

    if (error) {
      showToast(`Error rescheduling: ${error}`, 'error');
    } else {
      showToast(`Follow-up rescheduled for ${lead.name}`, 'success');
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleClear = async () => {
    setIsSubmitting(true);
    const { error } = await updateFollowUpDate(lead.id, null);
    setIsSubmitting(false);

    if (error) {
      showToast(`Error clearing follow-up: ${error}`, 'error');
    } else {
      showToast('Follow-up cleared', 'success');
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Follow-up"
      subtitle={`Lead: ${lead.name}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSave} className="space-y-4 text-left">
        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Quick Reschedule Options
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handlePresetSelect('later_today')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all text-left"
            >
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Later Today (+4h)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('tomorrow')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all text-left"
            >
              <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Tomorrow (10 AM)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('in_2_days')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all text-left"
            >
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>+2 Days</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('next_week')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all text-left"
            >
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Next Week</span>
            </button>
          </div>
        </div>

        {/* Custom date input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Custom Date & Time
          </label>
          <input
            type="datetime-local"
            value={followUpAt}
            onChange={(e) => setFollowUpAt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 [color-scheme:dark]"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            Remove Follow-up
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-lg shadow-brand-600/25 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
