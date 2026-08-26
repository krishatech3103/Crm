import React, { useEffect, useState } from 'react';
import { Save, UserRound } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { StaffProfile, UserRole } from '../../types/staff';

interface EditStaffMemberModalProps {
  staffMember: StaffProfile | null;
  onClose: () => void;
  onSave: (updates: Pick<StaffProfile, 'username' | 'role'>) => Promise<{ error: string | null }>;
}

export const EditStaffMemberModal: React.FC<EditStaffMemberModalProps> = ({ staffMember, onClose, onSave }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('salesperson');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!staffMember) return;
    setUsername(staffMember.username);
    setRole(staffMember.role);
    setError(null);
  }, [staffMember]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Username is required.');
      return;
    }

    setIsSaving(true);
    const result = await onSave({ username: trimmedUsername, role });
    setIsSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={Boolean(staffMember)}
      onClose={onClose}
      title="Edit staff member"
      subtitle="Manage the username and access role."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-xs font-semibold text-slate-300">
          Username
          <div className="relative mt-1.5">
            <UserRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-brand-500"
              autoComplete="username"
              disabled={isSaving}
              required
            />
          </div>
        </label>

        <label className="block text-xs font-semibold text-slate-300">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
            disabled={isSaving}
          >
            <option value="admin">Admin</option>
            <option value="salesperson">Salesperson</option>
          </select>
        </label>

        {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">{error}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {isSaving ? 'Saving…' : 'Save staff member'}
        </button>
      </form>
    </Modal>
  );
};
