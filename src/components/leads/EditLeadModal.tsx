import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Lead, LeadStatus } from '../../types/lead';
import { useLeads } from '../../hooks/useLeads';
import { useToast } from '../../context/ToastContext';
import { APP_CONFIG } from '../../config/app.config';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useBusinessCategories } from '../../hooks/useBusinessCategories';
import { Save, Phone, Building2, MapPin, Globe, Calendar, Camera, Tags } from 'lucide-react';
import { toInputDateTimeLocal } from '../../utils/date';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess?: () => void;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const { updateLead } = useLeads();
  const { categories } = useBusinessCategories();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: lead.business_name || lead.name,
    phone: lead.phone,
    business_name: lead.business_name || lead.name,
    business_category: lead.business_category || '',
    status: lead.status,
    follow_up_at: toInputDateTimeLocal(lead.follow_up_at),
    address: lead.address || '',
    google_business_url: lead.google_business_url || '',
    instagram_url: lead.instagram_url || '',
    website_url: lead.website_url || '',
    source: APP_CONFIG.leadSources.includes(lead.source || '') ? lead.source as string : 'Local',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const businessName = e.target.value;
    setFormData((prev) => ({ ...prev, business_name: businessName, name: businessName }));
  };

  const saveChanges = async () => {
    setIsSubmitting(true);
    let isoFollowUp: string | null = null;
    if (formData.follow_up_at) {
      isoFollowUp = new Date(formData.follow_up_at).toISOString();
    }

    const { error } = await updateLead(lead.id, {
      name: formData.business_name.trim(),
      phone: formData.phone.trim(),
      business_name: formData.business_name.trim(),
      business_category: formData.business_category.trim() || null,
      status: formData.status as LeadStatus,
      follow_up_at: isoFollowUp,
      address: formData.address.trim() || null,
      google_business_url: formData.google_business_url.trim() || null,
      instagram_url: formData.instagram_url.trim() || null,
      website_url: formData.website_url.trim() || null,
      source: formData.source.trim() || null,
    });

    setIsSubmitting(false);

    if (error) {
      showToast(`Update failed: ${error}`, 'error');
    } else {
      showToast('Lead details updated successfully', 'success');
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name.trim() || !formData.phone.trim()) {
      showToast('Business name and phone are required', 'error');
      return;
    }

    const onlyFollowUpDateChanged =
      formData.business_name.trim() === (lead.business_name || lead.name) &&
      formData.phone.trim() === lead.phone &&
      formData.business_category.trim() === (lead.business_category || '') &&
      formData.status === lead.status &&
      formData.address.trim() === (lead.address || '') &&
      formData.google_business_url.trim() === (lead.google_business_url || '') &&
      formData.instagram_url.trim() === (lead.instagram_url || '') &&
      formData.website_url.trim() === (lead.website_url || '') &&
      formData.source.trim() === (lead.source || 'Google');

    if (onlyFollowUpDateChanged) {
      void saveChanges();
    } else {
      setIsConfirmOpen(true);
    }
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Lead Information" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Business Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                name="business_name"
                required
                value={formData.business_name}
                onChange={handleBusinessNameChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Business Category
            </label>
            <div className="relative">
              <Tags className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <select
                name="business_category"
                value={formData.business_category}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Lead Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
          >
            {APP_CONFIG.statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Follow-up Date & Time</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="datetime-local"
                name="follow_up_at"
                value={formData.follow_up_at}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Lead Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              {APP_CONFIG.leadSources.map((source) => <option key={source} value={source}>{source}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Address / Location</label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Google Business Profile URL</label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="url"
                name="google_business_url"
                value={formData.google_business_url}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Instagram URL</label>
            <div className="relative">
              <Camera className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Website URL</label>
          <input
            type="url"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/25 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Updating...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => void saveChanges()}
        title="Save lead changes?"
        message="Confirm the changes to this lead. Follow-up date-only changes are saved without this confirmation."
        confirmText="Save changes"
      />
    </>
  );
};
