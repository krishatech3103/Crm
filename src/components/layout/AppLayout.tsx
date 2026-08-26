import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 mb-16 md:mb-0 w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
};
