import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, Settings, LogOut, ShieldCheck, Zap, BriefcaseBusiness } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config/app.config';
import ktLogo from '../../assets/kt-logo.jpeg';

export const Sidebar: React.FC = () => {
  const { user, logout, role, staffProfile } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Leads Directory', path: '/leads', icon: Users },
    { label: 'Clients', path: '/clients', icon: BriefcaseBusiness },
    { label: 'Follow-ups Pipeline', path: '/followups', icon: CalendarCheck },
    { label: 'Settings & Admin', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-indigo-500/15 hidden md:flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-61px)] sticky top-[61px] shadow-2xl">
      {/* Primary Navigation & Krisha Tech Brand Card */}
      <div className="space-y-6">
        {/* Brand Card Widget */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900/80 border border-indigo-500/20 flex items-center gap-3 shadow-inner">
          <img
            src={ktLogo}
            alt="Krisha Tech"
            className="w-11 h-11 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-xs font-extrabold text-white truncate uppercase tracking-wider">
              {APP_CONFIG.company}
            </h2>
            <p className="text-[11px] text-indigo-300 font-medium truncate flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Digital Agency</span>
            </p>
          </div>
        </div>

        <div>
          <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
            Navigation Menu
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600/30 to-violet-600/30 text-white border border-brand-500/40 shadow-lg shadow-brand-600/15 translate-x-1'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 hover:translate-x-0.5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Security & Access Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5 text-slate-400">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Krisha Tech Sales Hub</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Optimized for fast lead capture, direct WhatsApp actions, and team management.
          </p>
        </div>
      </div>

      {/* User Footer */}
      {user && (
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="px-2 text-xs">
            <p className="text-white font-semibold truncate">{staffProfile?.username || 'Staff member'}</p>
            <p className="text-[10px] text-slate-400 truncate font-medium capitalize">{role || 'salesperson'}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-all hover:scale-[1.01]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
