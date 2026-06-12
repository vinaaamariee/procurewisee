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
    if (rate >= 90) return { color: 'var(--green)', bg: 'var(--green-dim)', label: 'Excellent' };
    if (rate >= 80) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Good' };
    return { color: '#ef4444', bg: 'var(--red-dim)', label: 'Poor' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Toast Alert */}
      {errorMsg && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: 12,
          background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444', fontSize: '0.85rem', fontWeight: 500,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>⚠️ {errorMsg}</span>
          <button 
            onClick={() => setErrorMsg(null)} 
            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
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
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '1.25rem',
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow-card)',
      }}>
        
        {/* Search */}
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }}>
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
              background: 'var(--bg-deep)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border 0.2s',
            }}
          />
        </div>

        {/* Verification Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-dark)', padding: '0.25rem', borderRadius: 10, border: '1px solid var(--border)' }}>
          {(['All', 'Verified', 'Unverified'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setVerificationFilter(filter)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 8,
                border: 'none',
                background: verificationFilter === filter ? 'var(--accent-glass)' : 'transparent',
                color: verificationFilter === filter ? 'var(--accent)' : 'var(--text-secondary)',
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
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.5rem 1.5rem 0.5rem 0.75rem',
              borderRadius: 8,
              background: 'var(--bg-deep)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="name" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>Company Name (A-Z)</option>
            <option value="reliability" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>Reliability Score (High to Low)</option>
            <option value="quality" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>Quality Compliance (High to Low)</option>
            <option value="delivery" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>Avg Delivery (Fastest first)</option>
          </select>
        </div>

      </div>

      {/* Main Table Grid */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
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
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    
                    {/* Column 1: Info */}
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.925rem' }}>{supplier.companyName}</div>
                      {supplier.tin && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>TIN: {supplier.tin}</div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>👤 {supplier.contactPerson || 'No contact person'}</span>
                        <span>📞 {supplier.contactNumber || 'No phone'}</span>
                        <span style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>📍 {supplier.businessAddress}</span>
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
                        background: supplier.isVerified ? 'var(--green-dim)' : 'var(--bg-dark)',
                        border: '1px solid var(--border)',
                        color: supplier.isVerified ? 'var(--green)' : 'var(--text-muted)',
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
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          {reliability.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, marginTop: '0.2rem' }}>
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
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          {supplier.historicalDeliveryDays}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
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
                            background: supplier.isVerified ? 'var(--red-dim)' : 'var(--green-dim)',
                            border: '1px solid var(--border)',
                            color: supplier.isVerified ? '#ef4444' : 'var(--green)',
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
                  <td colSpan={isOfficer ? 6 : 5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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
