import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../../config/app.config';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Plus, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import ktLogo from '../../assets/kt-logo.jpeg';

interface HeaderProps {
  onOpenAddLead: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddLead }) => {
  const { user, logout, role, staffProfile } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-indigo-500/15 px-4 py-2.5 shadow-xl shadow-indigo-950/20 glass-panel sm:px-6">
      <Link
        to="/"
        className="group flex min-w-0 items-center gap-2.5"
        aria-label="Krisha Tech CRM dashboard"
      >
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-brand-500 to-krisha-purple opacity-60 blur transition duration-300 group-hover:opacity-100" />
          <img
            src={ktLogo}
            alt="Krisha Tech Logo"
            className="relative h-10 w-10 rounded-xl border border-white/20 bg-slate-950/90 p-0.5 object-contain shadow-md"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="whitespace-nowrap text-base font-extrabold leading-none tracking-tight text-white sm:text-lg">
              {APP_CONFIG.company}
            </h1>
            <span className="rounded-md border border-indigo-400/35 bg-indigo-500/15 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-indigo-200">
              CRM
            </span>
          </div>
          <p className="mt-1 hidden text-[11px] font-medium text-slate-400 sm:block">
            {APP_CONFIG.tagline}
          </p>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold text-emerald-300 shadow-sm"
          title="CRM is live"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="sm:hidden">Live</span>
          <span className="hidden sm:inline">Live CRM</span>
        </span>

        {/* Mobile has equivalent actions in BottomNav; keep quick actions on desktop only. */}
        <div className="hidden items-center gap-2.5 md:flex">
          <button
            onClick={onOpenAddLead}
            className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all duration-200 hover:scale-[1.03] hover:from-brand-500 hover:to-indigo-500 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4 text-indigo-200" />
            <span>Add Lead</span>
            <Sparkles className="h-3.5 w-3.5 text-indigo-200 opacity-70" />
          </button>

          <Link
            to="/settings"
            className="rounded-xl border border-slate-700/60 bg-slate-800/80 p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-700 hover:text-white"
            title="Settings & Administration"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>

        {/* User account controls remain available on desktop without crowding mobile. */}
        {user && (
          <div className="hidden items-center gap-3 border-l border-slate-800 pl-3 md:flex">
            <div className="text-right text-xs">
              <p className="font-semibold text-slate-200">{staffProfile?.username || 'Staff member'}</p>
              <p className="flex items-center justify-end gap-1 text-[10px] font-medium text-brand-400">
                <ShieldCheck className="h-3 w-3" /> {role === 'admin' ? 'Admin' : 'Salesperson'}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-xl p-2 text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
