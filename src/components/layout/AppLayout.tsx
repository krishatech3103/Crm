import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { AddLeadModal } from '../leads/AddLeadModal';

export const AppLayout: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header onOpenAddLead={() => setIsAddModalOpen(true)} />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 mb-16 md:mb-0 w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <BottomNav onOpenAddLead={() => setIsAddModalOpen(true)} />

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
