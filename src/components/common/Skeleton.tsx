import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="glass-panel rounded-xl p-5 animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-5 bg-slate-800 rounded w-1/3"></div>
      <div className="h-6 bg-slate-800 rounded-full w-20"></div>
    </div>
    <div className="h-4 bg-slate-800/60 rounded w-1/2"></div>
    <div className="h-4 bg-slate-800/40 rounded w-2/3"></div>
    <div className="flex gap-2 pt-2">
      <div className="h-8 bg-slate-800 rounded-lg w-24"></div>
      <div className="h-8 bg-slate-800 rounded-lg w-24"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="glass-panel p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-800 rounded w-1/4"></div>
          <div className="h-3 bg-slate-800/60 rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-slate-800 rounded-full w-24"></div>
        <div className="h-8 bg-slate-800 rounded-lg w-32 hidden sm:block"></div>
      </div>
    ))}
  </div>
);
