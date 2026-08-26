export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sales Manager' | 'Sales Agent';
  phone?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface AgencySettings {
  companyName: string;
  supportPhone: string;
  defaultWhatsAppMessage: string;
  leadSources: string[];
}
