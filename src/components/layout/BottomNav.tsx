import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, Settings, Plus, BriefcaseBusiness } from 'lucide-react';

interface BottomNavProps {
  onOpenAddLead: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenAddLead }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="glass-panel border-t border-indigo-500/20 px-1 py-1.5 flex items-center justify-around shadow-2xl shadow-indigo-950">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-1.5 py-1 rounded-xl text-[10px] font-semibold transition-all ${
              isActive ? 'text-brand-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/leads"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-1.5 py-1 rounded-xl text-[10px] font-semibold transition-all ${
              isActive ? 'text-brand-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Leads</span>
        </NavLink>

        <NavLink
          to="/clients"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-1.5 py-1 rounded-xl text-[10px] font-semibold transition-all ${
              isActive ? 'text-brand-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <BriefcaseBusiness className="w-5 h-5" />
          <span>Clients</span>
        </NavLink>

        {/* Center Floating Action Button */}
        <div className="relative -top-3">
          <button
            onClick={onOpenAddLead}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 via-indigo-600 to-krisha-purple p-3 text-white shadow-xl shadow-brand-600/40 border-2 border-slate-900 flex items-center justify-center transition-transform active:scale-90 hover:scale-110"
            title="Add Lead"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <NavLink
          to="/followups"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-1.5 py-1 rounded-xl text-[10px] font-semibold transition-all ${
              isActive ? 'text-brand-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Follow-ups</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-1.5 py-1 rounded-xl text-[10px] font-semibold transition-all ${
              isActive ? 'text-brand-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};
