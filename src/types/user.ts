export type UserRole = 'customer' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  isDefault: boolean;
}
