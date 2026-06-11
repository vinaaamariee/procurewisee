'use client';

import { useState, useTransition } from 'react';
import { verifySupplier } from '@/app/actions/suppliers';
import { useRouter } from 'next/navigation';

interface SupplierData {
  id: number;
  companyName: string;
  tin: string | null;
  contactPerson: string | null;
  contactNumber: string | null;
  businessAddress: string;
  reliabilityRating: any; // Decimal type
  qualityComplianceRate: any; // Decimal type
  historicalDeliveryDays: number;
  isVerified: boolean;
}

interface SupplierProfilesTableProps {
  initialSuppliers: SupplierData[];
  userRole: string;
}

export default function SupplierProfilesTable({
  initialSuppliers,
  userRole,
}: SupplierProfilesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'All' | 'Verified' | 'Unverified'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'reliability' | 'quality' | 'delivery'>('name');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOfficer = userRole === 'Procurement Officer';

  // Handler for verification toggle
  const handleToggleVerification = (supplierId: number) => {
    if (!isOfficer) {
      setErrorMsg('Unauthorized: Only Procurement Officers can change verification status.');
      return;
    }

    setUpdatingId(supplierId);
    setErrorMsg(null);

    startTransition(async () => {
      try {
        await verifySupplier(supplierId);
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to update verification status.');
      } finally {
        setUpdatingId(null);
      }
    });
  };

  // Convert decimal fields to numbers safely
  const getNum = (val: any) => {
    if (val === null || val === undefined) return 0;
    return typeof val === 'number' ? val : parseFloat(String(val)) || 0;
  };

  // Filter and sort logic
  const filteredSuppliers = initialSuppliers
    .filter((supplier) => {
      const matchesSearch =
        supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
        supplier.businessAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVerification =
        verificationFilter === 'All' ||
        (verificationFilter === 'Verified' && supplier.isVerified) ||
        (verificationFilter === 'Unverified' && !supplier.isVerified);

      return matchesSearch && matchesVerification;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.companyName.localeCompare(b.companyName);
      }
      if (sortBy === 'reliability') {
        return getNum(b.reliabilityRating) - getNum(a.reliabilityRating);
      }
      if (sortBy === 'quality') {
        return getNum(b.qualityComplianceRate) - getNum(a.qualityComplianceRate);
      }
      if (sortBy === 'delivery') {
        return a.historicalDeliveryDays - b.historicalDeliveryDays;
      }
      return 0;
    });

  // Helper to color quality compliance
  const getQualityStyle = (rate: number) => {
    if (rate >= 90) return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Excellent' };
    if (rate >= 80) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Good' };
    return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Poor' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Toast Alert */}
      {errorMsg && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: 12,
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', fontSize: '0.85rem', fontWeight: 500,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>⚠️ {errorMsg}</span>
          <button 
            onClick={() => setErrorMsg(null)} 
            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Toolbar / Filters Row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15,23,42,0.45)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '1.25rem',
        backdropFilter: 'blur(12px)',
      }}>
        
        {/* Search */}
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1rem' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search suppliers by name, contact, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.5rem',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f8fafc',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border 0.2s',
            }}
          />
        </div>

        {/* Verification Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
          {(['All', 'Verified', 'Unverified'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setVerificationFilter(filter)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 8,
                border: 'none',
                background: verificationFilter === filter ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: verificationFilter === filter ? '#818cf8' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort By Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.5rem 1.5rem 0.5rem 0.75rem',
              borderRadius: 8,
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="name">Company Name (A-Z)</option>
            <option value="reliability">Reliability Score (High to Low)</option>
            <option value="quality">Quality Compliance (High to Low)</option>
            <option value="delivery">Avg Delivery (Fastest first)</option>
          </select>
        </div>

      </div>

      {/* Main Table Grid */}
      <div style={{
        background: 'rgba(15,23,42,0.65)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Supplier / Address</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Verification Status</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>Reliability (5.00)</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>Quality Compliance</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>Avg Delivery Lead Time</th>
                {isOfficer && (
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'right' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => {
                const reliability = getNum(supplier.reliabilityRating);
                const quality = getNum(supplier.qualityComplianceRate);
                const qStyle = getQualityStyle(quality);

                return (
                  <tr 
                    key={supplier.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    
                    {/* Column 1: Info */}
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.925rem' }}>{supplier.companyName}</div>
                      {supplier.tin && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>TIN: {supplier.tin}</div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <span>👤 {supplier.contactPerson || 'No contact person'}</span>
                        <span>📞 {supplier.contactNumber || 'No phone'}</span>
                        <span style={{ color: '#475569', marginTop: '0.2rem' }}>📍 {supplier.businessAddress}</span>
                      </div>
                    </td>

                    {/* Column 2: Status */}
                    <td style={{ padding: '1.25rem', verticalAlign: 'middle' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 999,
                        background: supplier.isVerified ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.08)',
                        border: `1px solid ${supplier.isVerified ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`,
                        color: supplier.isVerified ? '#34d399' : '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                      }}>
                        <span>●</span>
                        {supplier.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>

                    {/* Column 3: Reliability */}
                    <td style={{ padding: '1.25rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace' }}>
                          {reliability.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600, marginTop: '0.2rem' }}>
                          {'★'.repeat(Math.round(reliability)) + '☆'.repeat(5 - Math.round(reliability))}
                        </div>
                      </div>
                    </td>

                    {/* Column 4: Quality */}
                    <td style={{ padding: '1.25rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: qStyle.color, fontFamily: 'monospace' }}>
                          {quality.toFixed(2)}%
                        </span>
                        <span style={{
                          padding: '0.15rem 0.5rem', borderRadius: 4,
                          background: qStyle.bg, color: qStyle.color,
                          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {qStyle.label}
                        </span>
                      </div>
                    </td>

                    {/* Column 5: Delivery Days */}
                    <td style={{ padding: '1.25rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
                          {supplier.historicalDeliveryDays}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Avg Days
                        </span>
                      </div>
                    </td>

                    {/* Column 6: Actions */}
                    {isOfficer && (
                      <td style={{ padding: '1.25rem', textAlign: 'right', verticalAlign: 'middle' }}>
                        <button
                          type="button"
                          disabled={updatingId === supplier.id}
                          onClick={() => handleToggleVerification(supplier.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 8,
                            background: supplier.isVerified ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            border: `1px solid ${supplier.isVerified ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                            color: supplier.isVerified ? '#f87171' : '#34d399',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: updatingId === supplier.id ? 'not-allowed' : 'pointer',
                            opacity: updatingId === supplier.id ? 0.6 : 1,
                            transition: 'all 0.2s',
                          }}
                        >
                          {updatingId === supplier.id 
                            ? 'Updating...' 
                            : supplier.isVerified ? 'Revoke Verification' : 'Verify Supplier'}
                        </button>
                      </td>
                    )}

                  </tr>
                );
              })}

              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={isOfficer ? 6 : 5} style={{ padding: '4rem', textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
                    No suppliers match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
