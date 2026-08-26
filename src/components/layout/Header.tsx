import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../../config/app.config';
import { useAuth } from '../../context/AuthContext';
import { Plus, LogOut, Flame, Sparkles, Settings } from 'lucide-react';
import ktLogo from '../../assets/kt-logo.jpeg';

interface HeaderProps {
  onOpenAddLead: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddLead }) => {
  const { user, logout, isDemoMode } = useAuth();

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-indigo-500/15 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-xl shadow-indigo-950/20">
      {/* Brand & Krisha Tech Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-krisha-purple rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300 animate-pulse-subtle" />
          <img
            src={ktLogo}
            alt="Krisha Tech Logo"
            className="relative w-10 h-10 rounded-xl object-cover border border-white/20 shadow-md"
          />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight leading-none gradient-text">
              {APP_CONFIG.name}
            </h1>
            {isDemoMode ? (
              <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Flame className="w-3 h-3 text-amber-400" />
                Demo Mode
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Cloud
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5 font-medium">
            {APP_CONFIG.tagline}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        {/* Prominent Quick + Add Lead button with glowing effect */}
        <button
          onClick={onOpenAddLead}
          className="relative group inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
        >
          <Plus className="w-4 h-4 text-indigo-200 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add Lead</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-200 opacity-70 group-hover:opacity-100" />
        </button>

        {/* Quick Settings Gear Link */}
        <Link
          to="/settings"
          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700/60 transition-all shadow-sm"
          title="Settings & Administration"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* User email & logout trigger for desktop */}
        {user && (
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right text-xs">
              <p className="text-slate-200 font-semibold">{user.email}</p>
              <p className="text-[10px] text-brand-400 font-medium">Staff Account</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
