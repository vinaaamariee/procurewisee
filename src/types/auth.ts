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
}

export const ROLE_LABELS: Record<UserRole, string> = {
  'Procurement Officer':    'Procurement Officer',
  'Administrative Approver': 'Administrative Approver',
  'Supplier':               'Supplier',
  'End User':               'End User',
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  'Procurement Officer':    { bg: 'rgba(99,102,241,0.15)',  text: '#818cf8', border: 'rgba(99,102,241,0.3)'  },
  'Administrative Approver': { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)'  },
  'Supplier':               { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)'  },
  'End User':               { bg: 'rgba(126,25,27,0.15)',  text: '#7e191b', border: 'rgba(126,25,27,0.3)'   },
};

export const ROLE_HOME: Record<UserRole, string> = {
  'Procurement Officer':    '/dashboard/officer',
  'Administrative Approver': '/dashboard/approver',
  'Supplier':               '/dashboard/supplier',
  'End User':               '/dashboard/end-user',
};
