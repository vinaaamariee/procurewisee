export type UserRole =
  | 'Procurement Officer'
  | 'Administrative Approver'
  | 'Supplier'
  | 'End User';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  supplierId?: number | null;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  'Procurement Officer':    'Procurement Staff',
  'Administrative Approver': 'Procurement Officer II',
  'Supplier':               'Supplier',
  'End User':               'End User',
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  'Procurement Officer':    { bg: 'rgba(128, 0, 0, 0.15)',  text: '#800000', border: 'rgba(128, 0, 0, 0.3)'  },
  'Administrative Approver': { bg: 'rgba(212, 175, 55, 0.15)', text: '#D4AF37', border: 'rgba(212, 175, 55, 0.3)'  },
  'Supplier':               { bg: 'rgba(212, 175, 55, 0.15)', text: '#D4AF37', border: 'rgba(212, 175, 55, 0.3)'  },
  'End User':               { bg: 'rgba(128, 0, 0, 0.15)',  text: '#800000', border: 'rgba(128, 0, 0, 0.3)'   },
};

export const ROLE_HOME: Record<UserRole, string> = {
  'Procurement Officer':    '/dashboard/officer',
  'Administrative Approver': '/dashboard/approver',
  'Supplier':               '/unauthorized',
  'End User':               '/dashboard/end-user',
};
