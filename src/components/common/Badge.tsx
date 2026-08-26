import React from 'react';
import type { LeadStatus } from '../../types/lead';
import { APP_CONFIG } from '../../config/app.config';

interface BadgeProps {
  status: LeadStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md', className = '' }) => {
  const config = APP_CONFIG.statuses.find(s => s.value === status) || {
    label: status,
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {config.label}
    </span>
  );
};
