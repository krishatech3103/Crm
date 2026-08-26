export const APP_CONFIG = {
  name: 'Krisha Tech CRM',
  tagline: 'Internal Lead & Sales Management System',
  company: 'Krisha Tech',
  version: '1.2.0',
  defaultPageTitle: 'Krisha Tech CRM - Internal Lead & Follow-up Manager',
  
  // Follow-up status defaults
  defaultLeadStatus: 'New',
  
  // Lead Statuses and theme configurations (Electric Violet/Indigo SaaS System)
  statuses: [
    { label: 'New', value: 'New', color: 'indigo', bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-indigo-500/10 shadow-sm' },
    { label: 'Contacted', value: 'Contacted', color: 'sky', bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-sky-500/10 shadow-sm' },
    { label: 'Demo Sent', value: 'Demo Sent', color: 'violet', bg: 'bg-violet-500/15 text-violet-300 border-violet-500/30 shadow-violet-500/10 shadow-sm' },
    { label: 'Follow-up', value: 'Follow-up', color: 'amber', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/10 shadow-sm animate-pulse-subtle' },
    { label: 'Won', value: 'Won', color: 'emerald', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10 shadow-sm font-semibold' },
    { label: 'Not Interested', value: 'Not Interested', color: 'rose', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-rose-500/10 shadow-sm' },
  ],

  leadSources: ['Google', 'Instagram', 'Local'],

  // Note Types
  noteTypes: [
    { label: 'Call', value: 'Call', icon: 'Phone' },
    { label: 'WhatsApp', value: 'WhatsApp', icon: 'MessageSquare' },
    { label: 'General', value: 'General', icon: 'FileText' },
    { label: 'Meeting', value: 'Meeting', icon: 'Users' },
  ],

  // Quick Reschedule Options
  rescheduleOptions: [
    { label: 'Later Today (4 hours)', key: 'later_today' },
    { label: 'Tomorrow', key: 'tomorrow' },
    { label: '+2 Days', key: 'in_2_days' },
    { label: 'Next Week (7 days)', key: 'next_week' },
  ]
};
