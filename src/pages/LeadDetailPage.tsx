import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useLeads } from '../hooks/useLeads';
import { useLeadNotes } from '../hooks/useLeadNotes';
import { Badge } from '../components/common/Badge';
import { ActivityTimeline } from '../components/timeline/ActivityTimeline';
import { LogCallModal } from '../components/leads/LogCallModal';
import { RescheduleModal } from '../components/leads/RescheduleModal';
import { EditLeadModal } from '../components/leads/EditLeadModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { getWhatsAppUrl, getTelUrl } from '../utils/phone';
import { sanitizeUrl } from '../utils/maps';
import { formatDateTime, getFollowUpCategory } from '../utils/date';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/app.config';
import type { LeadStatus } from '../types/lead';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  PhoneCall,
  Calendar,
  Globe,
  Camera,
  MapPin,
  Edit3,
  Trash2,
  Clock,
  Sparkles,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { leads, loading: leadsLoading, updateLeadStatus, deleteLead, refetch: refetchLeads } = useLeads();
  const { notes, loading: notesLoading, refetch: refetchNotes } = useLeadNotes(id);
  const { showToast } = useToast();
  const { role } = useAuth();

  const lead = leads.find((l) => l.id === id);

  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  useEffect(() => {
    if (lead?.status === 'Won' && location.pathname.startsWith('/leads/')) {
      navigate(`/clients/${lead.id}`, { replace: true });
    }
  }, [lead?.id, lead?.status, location.pathname, navigate]);

  if (leadsLoading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-6 bg-slate-800 rounded w-1/4" />
        <div className="h-40 bg-slate-800 rounded-2xl" />
        <div className="h-60 bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Lead Record Not Found</h3>
        <p className="text-xs text-slate-400">The requested prospect lead record does not exist or was deleted.</p>
        <Link
          to="/leads"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leads Directory</span>
        </Link>
      </div>
    );
  }

  const businessName = lead.business_name || lead.name;
  const isClient = lead.status === 'Won';
  const directoryPath = isClient ? '/clients' : '/leads';
  const directoryLabel = isClient ? 'Clients' : 'Leads Directory';
  const followUpCategory = getFollowUpCategory(lead.follow_up_at);

  const copyBusinessDetails = () => {
    const text = `Business: ${businessName}\nPhone: ${lead.phone}\nAddress: ${lead.address || 'N/A'}`;
    navigator.clipboard.writeText(text);
    showToast('Business details copied to clipboard!', 'success');
  };

  const handleDeleteConfirm = async () => {
    const { error } = await deleteLead(lead.id);
    if (error) {
      showToast(`Delete failed: ${error}`, 'error');
    } else {
      showToast(`Business "${businessName}" deleted`, 'success');
      navigate(directoryPath, { replace: true });
    }
  };

  const handleStatusQuickChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as LeadStatus;
    if (newStatus !== lead.status) setPendingStatus(newStatus);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    const { error } = await updateLeadStatus(lead.id, pendingStatus);
    if (error) showToast(`Status update failed: ${error}`, 'error');
    else {
      showToast(`Status updated to ${pendingStatus}`, 'success');
      refetchLeads();
    }
    setPendingStatus(null);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto animate-fade-in">
      {/* Navigation link */}
      <div>
        <Link
          to={directoryPath}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {directoryLabel}</span>
        </Link>
      </div>

      {/* Main Hero Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-indigo-500/20 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{businessName}</h1>
              <Badge status={lead.status} size="md" />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
              <span className="font-mono font-medium bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                {lead.phone}
              </span>

              {lead.business_category && (
                <span className="text-[11px] font-semibold bg-violet-500/15 text-violet-200 border border-violet-500/30 px-3 py-1 rounded-lg">
                  Category: {lead.business_category}
                </span>
              )}
              {lead.source && (
                <span className="text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg">
                  Source: {lead.source}
                </span>
              )}
            </div>
            {lead.address && <p className="text-xs leading-5 text-slate-400">Address: {lead.address}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all border border-slate-700/60"
              title="Edit Lead"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={copyBusinessDetails}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all border border-slate-700/60"
              title="Copy Business Details"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {role === 'admin' && (
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-2.5 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-500/10 rounded-xl transition-all border border-slate-700/60"
                title="Delete Lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary One-Tap Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
          <a
            href={getTelUrl(lead.phone)}
            onClick={() => setIsLogCallOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all text-sm hover:scale-[1.02]"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </a>

          <a
            href={getWhatsAppUrl(lead.phone, `Hello ${businessName}, Krisha Tech here regarding web design & local digital growth services...`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all text-sm hover:scale-[1.02]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={() => setIsLogCallOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-bold border border-slate-700/80 rounded-xl transition-all text-sm hover:scale-[1.02]"
          >
            <PhoneCall className="w-4 h-4 text-brand-400" />
            <span>Log Call Note</span>
          </button>
        </div>

        {/* Compact external profile links. Address remains plain text; it is not treated as a map link. */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {lead.google_business_url && (
            <a
              href={sanitizeUrl(lead.google_business_url)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Google Business Profile"
              title="Google Business Profile"
              className="inline-flex rounded-xl border border-sky-500/30 bg-slate-950/80 p-2.5 text-sky-400 transition-colors hover:bg-slate-800"
            >
              <MapPin className="w-4 h-4" />
            </a>
          )}

          {lead.instagram_url && (
            <a
              href={sanitizeUrl(lead.instagram_url)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Instagram"
              title="Instagram"
              className="inline-flex rounded-xl border border-purple-500/30 bg-slate-950/80 p-2.5 text-purple-400 transition-colors hover:bg-slate-800"
            >
              <Camera className="w-4 h-4" />
            </a>
          )}

          {lead.website_url && (
            <a
              href={sanitizeUrl(lead.website_url)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open website"
              title="Website"
              className="inline-flex rounded-xl border border-emerald-500/30 bg-slate-950/80 p-2.5 text-emerald-400 transition-colors hover:bg-slate-800"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Follow-up & Quick Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scheduled Follow-up card */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between gap-4 border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Scheduled Follow-up
            </span>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              {lead.follow_up_at ? (
                <span
                  className={
                    followUpCategory === 'overdue'
                      ? 'text-rose-400 font-extrabold'
                      : followUpCategory === 'today'
                      ? 'text-amber-300 font-extrabold'
                      : 'text-white'
                  }
                >
                  {followUpCategory === 'overdue' && '⚠️ '}
                  {formatDateTime(lead.follow_up_at)}
                </span>
              ) : (
                <span className="text-slate-500 text-xs font-medium">No follow-up scheduled</span>
              )}
            </p>
          </div>

          <button
            onClick={() => setIsRescheduleOpen(true)}
            className="px-3.5 py-2 text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl transition-all shrink-0"
          >
            {lead.follow_up_at ? 'Reschedule' : '+ Schedule'}
          </button>
        </div>

        {/* Quick Status Selector card */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between gap-4 border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Lead Stage & Status
            </span>
            <p className="text-xs text-slate-400 font-medium">Instant pipeline transition</p>
          </div>

          <select
            value={pendingStatus || lead.status}
            onChange={handleStatusQuickChange}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-brand-500 shadow-inner"
          >
            {APP_CONFIG.statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Timeline Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-extrabold text-white">Call Log Notes</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLogCallOpen(true)}
              className="text-xs font-bold text-brand-300 hover:text-white transition-colors flex items-center gap-1 bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">+ Log Call Note</span>
              <span className="sm:hidden">+ Log</span>
            </button>
            <button
              onClick={() => setIsNotesOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              aria-expanded={isNotesOpen}
            >
              {isNotesOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {isNotesOpen ? 'Hide' : 'Open'}
            </button>
          </div>
        </div>

        {isNotesOpen && (
          <ActivityTimeline
            notes={notes}
            createdDate={lead.created_at}
            loading={notesLoading}
          />
        )}
      </div>

      {/* Modals */}
      <LogCallModal
        isOpen={isLogCallOpen}
        onClose={() => setIsLogCallOpen(false)}
        lead={lead}
        onSuccess={() => {
          refetchLeads();
          refetchNotes();
        }}
      />

      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        lead={lead}
        onSuccess={refetchLeads}
      />

      <EditLeadModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        lead={lead}
        onSuccess={() => {
          refetchLeads();
          refetchNotes();
        }}
      />

      {role === 'admin' && (
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Lead Record?"
          message={`Are you sure you want to permanently delete "${businessName}"? This action cannot be undone.`}
          confirmText="Delete Lead"
          isDangerous
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={confirmStatusChange}
        title="Change lead status?"
        message={`Change this lead's status to ${pendingStatus || ''}?`}
        confirmText="Change status"
      />
    </div>
  );
};
