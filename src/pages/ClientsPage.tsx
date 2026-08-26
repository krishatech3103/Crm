import React, { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { LeadCard } from '../components/leads/LeadCard';
import { LogCallModal } from '../components/leads/LogCallModal';
import { RescheduleModal } from '../components/leads/RescheduleModal';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import type { Lead } from '../types/lead';
import { BriefcaseBusiness } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { leads, loading, refetch } = useLeads();
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);
  const [selectedLeadForReschedule, setSelectedLeadForReschedule] = useState<Lead | null>(null);
  const clients = leads.filter((lead) => lead.status === 'Won');

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl gradient-text">
          <BriefcaseBusiness className="h-6 w-6 text-emerald-300" /> Clients
        </h2>
        <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">
          Won opportunities are managed here as clients, separate from active leads.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : clients.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
          {clients.map((client) => (
            <LeadCard
              key={client.id}
              lead={client}
              onLogCall={setSelectedLeadForCall}
              onReschedule={setSelectedLeadForReschedule}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No clients yet"
          description="A lead appears here automatically when its status changes to Won."
        />
      )}

      {selectedLeadForCall && (
        <LogCallModal
          isOpen
          onClose={() => setSelectedLeadForCall(null)}
          lead={selectedLeadForCall}
          onSuccess={refetch}
        />
      )}
      {selectedLeadForReschedule && (
        <RescheduleModal
          isOpen
          onClose={() => setSelectedLeadForReschedule(null)}
          lead={selectedLeadForReschedule}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};
