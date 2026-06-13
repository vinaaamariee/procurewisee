import { getAuthenticatedUser } from '@/lib/auth/get-user-profile';
import { getSupplierProfiles } from '@/app/actions/suppliers';
import SupplierProfilesTable from '@/components/supplier/SupplierProfilesTable';
import { redirect } from 'next/navigation';

import { ROLE_HOME } from '@/types/auth';

export const metadata = { title: 'Supplier Directory — ProcureWise' };

export default async function SupplierProfilesPage() {
  // Ensure the user is authenticated
  const { profile } = await getAuthenticatedUser();
  const roleHome = ROLE_HOME[profile.role] || '/';

  // Role Gate: Only Procurement Officer and Administrative Approver can view supplier profiles
  const allowedRoles = ['Procurement Officer', 'Administrative Approver'];
  if (!allowedRoles.includes(profile.role)) {
    redirect('/unauthorized');
  }

  // Fetch all suppliers
  const suppliers = await getSupplierProfiles();

  // Brand Colors mapped from your Login Page design
  const theme = {
    crimson: '#7e191b',
    gold: '#dcb353',
    goldDark: '#b88a1b',
    dark: '#111827',
    textMain: '#1f2937',
    textMuted: '#6b7280',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', fontFamily: '"Inter", sans-serif' }}>
      
      {/* ── Page Header & Navigation ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <a
            href={roleHome}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem',
              backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${theme.glassBorder}`,
              borderRadius: '999px', color: theme.textMain, textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              cursor: 'pointer'
            }}
          >
            <span>←</span> Back to Dashboard
          </a>
        </div>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: theme.textMain, margin: 0, letterSpacing: '-0.5px' }}>
            Supplier Directory & Intelligence Audit
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: theme.textMuted, margin: '0.5rem 0 0 0' }}>
            Inspect supplier performance metrics, audit quality compliance rates, and manage verification standing.
          </p>
        </div>
      </div>

      {/* ── Supplier Table Component Container ── */}
      {/* Wrapped in the ProcureWise Glassmorphic Card Style */}
      <div style={{
        background: theme.glassBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.glassBorder}`, borderRadius: '1.25rem', overflow: 'hidden', 
        boxShadow: theme.shadow, padding: '2rem'
      }}>
        <SupplierProfilesTable 
          initialSuppliers={suppliers} 
          userRole={profile.role} 
        />
      </div>

    </div>
  );
}