import React from 'react';
import { Modal } from '../common/Modal';
import type { Lead } from '../../types/lead';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingLead: Lead;
  onContinueAnyway: () => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  onClose,
  existingLead,
  onContinueAnyway,
}) => {
  const navigate = useNavigate();

  const handleViewExisting = () => {
    onClose();
    navigate(`/leads/${existingLead.id}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duplicate Lead Detected" maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">A lead with this phone number already exists!</p>
            <p className="text-amber-300/80">Phone: {existingLead.phone}</p>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl text-left space-y-1 text-xs">
          <p className="text-slate-400">Existing Lead Details:</p>
          <p className="font-semibold text-sm text-white">{existingLead.name}</p>
          {existingLead.business_name && (
            <p className="text-slate-300">{existingLead.business_name}</p>
          )}
          <p className="text-slate-400">Status: <span className="text-brand-400 font-medium">{existingLead.status}</span></p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={handleViewExisting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-lg shadow-brand-600/20"
          >
            <span>View Existing Lead</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={onContinueAnyway}
            className="w-full px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Create duplicate lead anyway
          </button>
        </div>
      </div>
    </Modal>
  );
};
