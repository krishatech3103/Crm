import React, { useState } from 'react';
import { KeyRound, LockKeyhole } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { Modal } from '../common/Modal';

export const ForcePasswordChangeModal: React.FC = () => {
  const { user, staffProfile, refreshStaffProfile } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = Boolean(user && staffProfile?.must_change_password);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) {
      setError(passwordError.message || 'Unable to change your password.');
      setIsSubmitting(false);
      return;
    }

    await refreshStaffProfile();
    setPassword('');
    setConfirmPassword('');
    setIsSubmitting(false);
    showToast('Password updated successfully.', 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => undefined}
      title="Change your password"
      subtitle="Required before you continue using the CRM."
      maxWidth="sm"
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">
          <div className="mb-1 flex items-center gap-2 font-bold text-amber-200">
            <LockKeyhole className="h-4 w-4" /> First sign-in security step
          </div>
          Choose a private password for your account. This window cannot be dismissed until it is updated.
        </div>

        <label className="block text-xs font-semibold text-slate-300">
          New password
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
            disabled={isSubmitting}
            required
          />
        </label>

        <label className="block text-xs font-semibold text-slate-300">
          Confirm new password
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
            disabled={isSubmitting}
            required
          />
        </label>

        {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-950/40 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound className="h-4 w-4" />
          {isSubmitting ? 'Updating password…' : 'Set new password'}
        </button>
      </form>
    </Modal>
  );
};
