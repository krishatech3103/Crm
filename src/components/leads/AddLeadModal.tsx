import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { LeadFormData, Lead } from '../../types/lead';
import { useLeads } from '../../hooks/useLeads';
import { useToast } from '../../context/ToastContext';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import { APP_CONFIG } from '../../config/app.config';
import { useBusinessCategories } from '../../hooks/useBusinessCategories';
import { Plus, Phone, Building2, MapPin, Globe, Calendar, Camera, Tags } from 'lucide-react';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded?: (newLead: Lead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onLeadAdded,
}) => {
  const { addLead, checkDuplicatePhone } = useLeads();
  const { categories } = useBusinessCategories();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    phone: '',
    business_name: '',
    business_category: '',
    status: 'New',
    follow_up_at: '',
    address: '',
    google_business_url: '',
    instagram_url: '',
    website_url: '',
    source: 'Google',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateLead, setDuplicateLead] = useState<Lead | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      business_name: '',
      business_category: '',
      status: 'New',
      follow_up_at: '',
      address: '',
      google_business_url: '',
      instagram_url: '',
      website_url: '',
      source: 'Google',
    });
    setDuplicateLead(null);
    setShowDuplicateModal(false);
    setShowMoreFields(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const businessName = e.target.value;
    setFormData((prev) => ({ ...prev, business_name: businessName, name: businessName }));
  };

  const handleFormSubmit = async (e?: React.FormEvent, skipDuplicateCheck = false) => {
    if (e) e.preventDefault();

    if (!formData.business_name?.trim() || !formData.phone.trim()) {
      showToast('Business name and phone number are required', 'error');
      return;
    }

    if (!skipDuplicateCheck) {
      const existing = checkDuplicatePhone(formData.phone);
      if (existing) {
        setDuplicateLead(existing);
        setShowDuplicateModal(true);
        return;
      }
    }

    setIsSubmitting(true);
    const { lead, error } = await addLead(formData);
    setIsSubmitting(false);

    if (error) {
      showToast(`Error adding lead: ${error}`, 'error');
    } else if (lead) {
      showToast(`Business "${lead.business_name || lead.name}" added successfully!`, 'success');
      resetForm();
      onClose();
      if (onLeadAdded) onLeadAdded(lead);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Quick Add Lead" maxWidth="md">
        <form onSubmit={(e) => handleFormSubmit(e, false)} className="space-y-4 text-left">
          {/* Lead details in entry order */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Business Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Patel Electronics"
                  value={formData.business_name || ''}
                  onChange={handleBusinessNameChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-500"
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
                  value={formData.business_category || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Phone / WhatsApp Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-1">
            <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-all"
            >
              {APP_CONFIG.statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Initial Follow-up Date & Time</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="datetime-local"
                name="follow_up_at"
                value={formData.follow_up_at || ''}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Lead Source</label>
            <select
              name="source"
              value={formData.source || ''}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              {APP_CONFIG.leadSources.map((source) => <option key={source} value={source}>{source}</option>)}
            </select>
          </div>

          {/* Toggle additional optional details */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMoreFields(!showMoreFields)}
              className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
            >
              <span>{showMoreFields ? '- Hide Other Details' : '+ Add other details'}</span>
            </button>
          </div>

          {showMoreFields && (
            <div className="space-y-3 pt-2 border-t border-slate-800/60 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Address / Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. Shop 4, Main Road, Pune"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Google Business Profile URL</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="url"
                      name="google_business_url"
                      placeholder="https://maps.google.com/..."
                      value={formData.google_business_url || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Instagram URL</label>
                  <div className="relative">
                    <Camera className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="url"
                      name="instagram_url"
                      placeholder="https://instagram.com/..."
                      value={formData.instagram_url || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Website URL</label>
                <input
                  type="url"
                  name="website_url"
                  placeholder="https://example.com"
                  value={formData.website_url || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
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
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Lead'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Duplicate warning modal */}
      {duplicateLead && (
        <DuplicateWarningModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          existingLead={duplicateLead}
          onContinueAnyway={() => {
            setShowDuplicateModal(false);
            handleFormSubmit(undefined, true);
          }}
        />
      )}
    </>
  );
};
