import React, { useState } from 'react';
import { KeyRound, UserPlus, UserRound } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { UserRole } from '../../types/staff';

interface CreateStaffMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: { username: string; temporaryPassword: string; role: UserRole }) => Promise<{ error: string | null }>;
}

export const CreateStaffMemberModal: React.FC<CreateStaffMemberModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [username, setUsername] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [role, setRole] = useState<UserRole>('salesperson');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const close = () => {
    if (isCreating) return;
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (temporaryPassword.length < 8) {
      setError('Temporary password must be at least 8 characters.');
      return;
    }

    setIsCreating(true);
    const result = await onCreate({ username: username.trim(), temporaryPassword, role });
    setIsCreating(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setUsername('');
    setTemporaryPassword('');
    setRole('salesperson');
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Add staff user" subtitle="They will be required to change this temporary password on first login." maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-xs font-semibold text-slate-300">
          Username
          <div className="relative mt-1.5">
            <UserRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-brand-500" autoComplete="username" required disabled={isCreating} />
          </div>
        </label>

        <label className="block text-xs font-semibold text-slate-300">
          Temporary password
          <div className="relative mt-1.5">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input type="password" value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-brand-500" autoComplete="new-password" required disabled={isCreating} />
          </div>
        </label>

        <label className="block text-xs font-semibold text-slate-300">
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500" disabled={isCreating}>
            <option value="salesperson">Salesperson</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {error && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">{error}</p>}

        <button type="submit" disabled={isCreating} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          <UserPlus className="h-4 w-4" /> {isCreating ? 'Creating…' : 'Create staff user'}
        </button>
      </form>
    </Modal>
  );
};
