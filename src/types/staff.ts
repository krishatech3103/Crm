export type UserRole = 'admin' | 'salesperson';

export interface StaffProfile {
  id: string;
  username: string;
  role: UserRole;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}
