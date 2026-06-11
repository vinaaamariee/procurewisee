import { getAuthenticatedUser } from '@/lib/auth/get-user-profile';
import { getSupplierProfiles } from '@/app/actions/suppliers';
import SupplierProfilesTable from '@/components/supplier/SupplierProfilesTable';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Supplier Directory — ProcureWise' };

export default async function SupplierProfilesPage() {
  // Ensure the user is authenticated
  const { profile } = await getAuthenticatedUser();

  // Role Gate: Only Procurement Officer and Administrative Approver can view supplier profiles
  const allowedRoles = ['Procurement Officer', 'Administrative Approver'];
  if (!allowedRoles.includes(profile.role)) {
    redirect('/unauthorized');
  }

  // Fetch all suppliers
  const suppliers = await getSupplierProfiles();

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
          Supplier Directory & Intelligence Audit
        </h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: '#64748b' }}>
          Inspect supplier performance metrics, audit quality compliance rates, and manage verification standing.
        </p>
      </div>

      {/* Supplier Table Component */}
      <SupplierProfilesTable 
        initialSuppliers={suppliers} 
        userRole={profile.role} 
      />

    </div>
  );
}
