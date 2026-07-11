'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface SerializedPr {
  id: number;
  prNumber: string;
  department: string;
  office: string;
  purpose: string;
  totalCost: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  requesterName: string;
  decisionDate: string | null;
  reviewedBy: string;
}

interface HistoryClientProps {
  prs: SerializedPr[];
}

type TabType = 'pending' | 'under_review' | 'approved' | 'returned' | 'rejected';

export default function HistoryClient({ prs }: HistoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab') as TabType;
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Sync tab state with search params if present
  useEffect(() => {
    if (activeTabParam && ['pending', 'under_review', 'approved', 'returned', 'rejected'].includes(activeTabParam)) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  // Tab definitions
  const tabs: { key: TabType; label: string; count: number; color: string; bg: string }[] = [
    {
      key: 'pending',
      label: 'Pending',
      count: prs.filter(pr => pr.status === 'Submitted').length,
      color: '#1e3a8a',
      bg: 'rgba(30, 58, 138, 0.08)',
    },
    {
      key: 'under_review',
      label: 'Under Review',
      count: prs.filter(pr => pr.status === 'UnderReview').length,
      color: '#b45309',
      bg: 'rgba(180, 83, 9, 0.08)',
    },
    {
      key: 'approved',
      label: 'Approved',
      count: prs.filter(pr => pr.status === 'Approved' || pr.status === 'Received').length,
      color: '#047857',
      bg: 'rgba(4, 120, 87, 0.08)',
    },
    {
      key: 'returned',
      label: 'Returned',
      count: prs.filter(pr => pr.status === 'ReturnedForRevision').length,
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.08)',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      count: prs.filter(pr => pr.status === 'Rejected').length,
      color: '#7f1d1d',
      bg: 'rgba(127, 29, 29, 0.08)',
    },
  ];

  // Filter logic based on tab and search term
  const getFilteredPrs = () => {
    let tabPrs = prs;
    if (activeTab === 'pending') {
      tabPrs = prs.filter(pr => pr.status === 'Submitted');
    } else if (activeTab === 'under_review') {
      tabPrs = prs.filter(pr => pr.status === 'UnderReview');
    } else if (activeTab === 'approved') {
      tabPrs = prs.filter(pr => pr.status === 'Approved' || pr.status === 'Received');
    } else if (activeTab === 'returned') {
      tabPrs = prs.filter(pr => pr.status === 'ReturnedForRevision');
    } else if (activeTab === 'rejected') {
      tabPrs = prs.filter(pr => pr.status === 'Rejected');
    }

    if (!searchTerm.trim()) return tabPrs;
    
    const query = searchTerm.toLowerCase();
    return tabPrs.filter(pr => 
      pr.prNumber.toLowerCase().includes(query) ||
      pr.department.toLowerCase().includes(query) ||
      pr.requesterName.toLowerCase().includes(query) ||
      pr.purpose.toLowerCase().includes(query)
    );
  };

  const filteredPrs = getFilteredPrs();

  // Color constants
  const theme = {
    crimson: '#7e191b',
    goldDark: '#b88a1b',
    surface: 'var(--surface)',
    border: 'var(--border)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
    glassBg: 'rgba(255, 255, 255, 0.75)',
  };

  const setTabAndUrl = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/dashboard/approver/history?tab=${tab}`);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <a
            href="/dashboard/approver"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.2rem',
              backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: '999px', color: theme.textPrimary, textDecoration: 'none',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.75rem'
            }}
          >
            ← Back to Overview
          </a>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: theme.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
            Requisitions Workflow Center
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: theme.textSecondary, margin: '0.25rem 0 0 0' }}>
            Track and process Purchase Requests through their workflow lifecycle.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search PR number, dept, requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: '0.75rem',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.surface,
              color: theme.textPrimary,
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '2px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setTabAndUrl(tab.key)}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? `3px solid ${theme.crimson}` : '3px solid transparent',
                color: isActive ? theme.textPrimary : theme.textSecondary,
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: isActive ? theme.crimson : tab.bg,
                color: isActive ? '#fff' : tab.color,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table / Grid Container */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '1.25rem',
        boxShadow: theme.shadow,
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto', padding: '1.5rem' }}>
          {filteredPrs.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: theme.textSecondary, fontSize: '0.9rem' }}>
              No purchase requests found matching the current filters.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
                  <th style={{ padding: '0.75rem 1rem' }}>PR Number</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Department / Office</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Prepared By</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Budget</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Workflow Status</th>
                  {activeTab !== 'pending' && <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Decision Date</th>}
                  {activeTab !== 'pending' && <th style={{ padding: '0.75rem 1rem' }}>Reviewed By</th>}
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrs.map((pr) => (
                  <tr key={pr.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: theme.textPrimary }}>
                      {pr.prNumber}
                    </td>
                    <td style={{ padding: '1rem', color: theme.textPrimary }}>
                      {pr.department} ({pr.office})
                    </td>
                    <td style={{ padding: '1rem', color: theme.textPrimary }}>
                      {pr.requesterName}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                      ₱{pr.totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.60rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 
                          pr.status === 'Approved' || pr.status === 'Received' ? 'rgba(16, 185, 129, 0.1)' :
                          pr.status === 'ReturnedForRevision' ? 'rgba(239, 68, 68, 0.1)' :
                          pr.status === 'Rejected' ? 'rgba(127, 29, 29, 0.1)' :
                          pr.status === 'UnderReview' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(30, 58, 138, 0.08)',
                        color: 
                          pr.status === 'Approved' || pr.status === 'Received' ? '#10b981' :
                          pr.status === 'ReturnedForRevision' ? '#ef4444' :
                          pr.status === 'Rejected' ? '#7f1d1d' :
                          pr.status === 'UnderReview' ? '#d97706' : 'var(--accent)',
                      }}>
                        {pr.status === 'ReturnedForRevision' ? 'Returned for Revision' :
                         pr.status === 'UnderReview' ? 'Under Review' : pr.status}
                      </span>
                    </td>
                    {activeTab !== 'pending' && (
                      <td style={{ padding: '1rem', textAlign: 'center', color: theme.textPrimary }}>
                        {pr.decisionDate ? new Date(pr.decisionDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>
                    )}
                    {activeTab !== 'pending' && (
                      <td style={{ padding: '1rem', color: theme.textPrimary }}>
                        {pr.reviewedBy}
                      </td>
                    )}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <a href={`/dashboard/approver/history/${pr.id}`} style={{
                        display: 'inline-block',
                        padding: '0.4rem 1rem',
                        background: `linear-gradient(90deg, ${theme.crimson} 0%, ${theme.goldDark} 100%)`,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 6px rgba(126,25,27,0.15)',
                        transition: 'opacity 0.2s'
                      }} className="hover:opacity-90">
                        {activeTab === 'pending' || activeTab === 'under_review' ? 'Review PR' : 'View Details'}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
    </div>
  );
}
