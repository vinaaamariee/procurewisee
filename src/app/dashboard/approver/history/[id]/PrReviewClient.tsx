'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { startPrReview, approvePr, returnPr, rejectPr } from '@/app/actions/pr-approval';
import DocumentLayout from '@/components/documents/DocumentLayout';

interface PrItem {
  id: number;
  description: string;
  brand: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  estimatedCost: number;
  specification: string;
}

interface StatusHistoryEntry {
  id: number;
  status: string;
  remarks: string;
  changedByName: string;
  createdAt: string;
}

interface PrDetails {
  id: number;
  prNumber: string;
  trackingNumber: string | null;
  requestDate: string;
  department: string;
  office: string;
  purpose: string;
  fundingSource: string;
  estimatedBudget: number;
  totalCost: number;
  status: string;
  remarks: string | null;
  attachments: string | null;
  requesterName: string;
  requesterEmail: string;
  officerName: string;
  items: PrItem[];
  statusHistory: StatusHistoryEntry[];
}

interface PrReviewClientProps {
  pr: PrDetails;
  deptBudget: { allocated: number; spent: number } | null;
}

export default function PrReviewClient({ pr: initialPr, deptBudget }: PrReviewClientProps) {
  const router = useRouter();
  const [pr, setPr] = useState<PrDetails>(initialPr);
  const [isPending, startTransition] = useTransition();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'return' | 'reject' | 'approve' | null>(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

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

  // Toast helper
  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleStartReview = async () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await startPrReview(pr.id);
      if (res.success && res.pr) {
        showToast('Purchase Request Status updated to Under Review.');
        // Refresh local state and server data
        router.refresh();
        setPr((prev) => ({
          ...prev,
          status: 'UnderReview',
          statusHistory: [
            ...prev.statusHistory,
            {
              id: Date.now(),
              status: 'UnderReview',
              remarks: 'Approver started audit review.',
              changedByName: 'Administrative Approver',
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      } else {
        setErrorMsg(res.error || 'Failed to start review.');
      }
    });
  };

  const openActionModal = (type: 'return' | 'reject' | 'approve') => {
    setModalType(type);
    setRemarksInput('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if ((modalType === 'return' || modalType === 'reject') && !remarksInput.trim()) {
      setModalError('Remarks are mandatory for this action.');
      return;
    }

    setModalError(null);
    setIsModalOpen(false);

    startTransition(async () => {
      let res;
      let successMessage = '';
      const finalRemarks = remarksInput.trim();

      if (modalType === 'approve') {
        res = await approvePr(pr.id, finalRemarks || undefined);
        successMessage = 'Purchase Request Approved Successfully';
      } else if (modalType === 'return') {
        res = await returnPr(pr.id, finalRemarks);
        successMessage = 'Purchase Request Returned for Revision';
      } else {
        res = await rejectPr(pr.id, finalRemarks);
        successMessage = 'Purchase Request Rejected Successfully';
      }

      if (res.success && res.pr) {
        showToast(successMessage);
        router.refresh();
        setPr((prev) => ({
          ...prev,
          status: res.pr.status,
          statusHistory: [
            ...prev.statusHistory,
            {
              id: Date.now(),
              status: res.pr.status,
              remarks: finalRemarks || (modalType === 'approve' ? 'Approved for procurement.' : ''),
              changedByName: 'Administrative Approver',
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      } else {
        setErrorMsg(res.error || 'Failed to process request action.');
      }
    });
  };

  const remainingBudget = deptBudget ? deptBudget.allocated - deptBudget.spent : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000,
          backgroundColor: '#10b981', color: '#fff', padding: '1rem 2rem',
          borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          ✅ {toastMsg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '1.5rem' }}>
        <div>
          <a href="/dashboard/approver/history" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.2rem',
            backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: '999px', color: theme.textPrimary, textDecoration: 'none',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.75rem'
          }}>
            ← Back to History
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: theme.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
              {pr.prNumber}
            </h1>
            <span style={{
              padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800,
              backgroundColor: 
                pr.status === 'Approved' || pr.status === 'Received' ? 'rgba(16, 185, 129, 0.1)' :
                ['ReturnedForRevision', 'Returned for Revision'].includes(pr.status) ? 'rgba(239, 68, 68, 0.1)' :
                pr.status === 'Rejected' ? 'rgba(127, 29, 29, 0.1)' :
                pr.status === 'UnderReview' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(30, 58, 138, 0.08)',
              color: 
                pr.status === 'Approved' || pr.status === 'Received' ? '#10b981' :
                ['ReturnedForRevision', 'Returned for Revision'].includes(pr.status) ? '#ef4444' :
                pr.status === 'Rejected' ? '#7f1d1d' :
                pr.status === 'UnderReview' ? '#d97706' : 'var(--accent)',
            }}>
              {['ReturnedForRevision', 'Returned for Revision'].includes(pr.status) ? 'Returned for Revision' :
               pr.status === 'UnderReview' ? 'Under Review' : pr.status}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: theme.textSecondary, marginTop: '0.4rem' }}>
            Submitted by <strong>{pr.requesterName}</strong> ({pr.requesterEmail}) on {new Date(pr.requestDate).toLocaleDateString()}
          </p>
        </div>

        {/* Top Action Bar for Approver */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.print()}
            className="no-print"
            style={{
              padding: '0.6rem 1.4rem', borderRadius: '0.75rem', border: `1px solid ${theme.border}`,
              background: '#fff', color: theme.textPrimary,
              fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
            }}
          >
            🖨️ Print Request
          </button>

          {pr.status === 'Submitted' && (
            <button
              onClick={handleStartReview}
              disabled={isPending}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: '0.75rem', border: 'none',
                background: `linear-gradient(90deg, ${theme.crimson} 0%, ${theme.goldDark} 100%)`, color: '#fff',
                fontWeight: 700, fontSize: '0.8rem', cursor: isPending ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(126, 25, 27, 0.2)'
              }}
            >
              🔎 {isPending ? 'Starting...' : 'Start Review'}
            </button>
          )}

          {pr.status === 'UnderReview' && (
            <>
              <button
                onClick={() => openActionModal('approve')}
                disabled={isPending}
                style={{
                  padding: '0.6rem 1.4rem', borderRadius: '0.75rem', border: 'none',
                  background: 'linear-gradient(90deg, #10b981, #059669)', color: '#fff',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => openActionModal('return')}
                disabled={isPending}
                style={{
                  padding: '0.6rem 1.4rem', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)',
                  background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                ↩️ Return for Revision
              </button>
              <button
                onClick={() => openActionModal('reject')}
                disabled={isPending}
                style={{
                  padding: '0.6rem 1.4rem', borderRadius: '0.75rem', border: '1px solid rgba(127, 29, 29, 0.2)',
                  background: 'rgba(127, 29, 29, 0.05)', color: '#7f1d1d',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                ❌ Reject
              </button>
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="lg:grid-cols-3">
        
        {/* Left Column: Details & Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="lg:col-span-2">
          
          {/* Approval Details Card (Section 6) */}
          {["Approved", "Received", "ReturnedForRevision", "Returned for Revision", "Rejected"].includes(pr.status) && (
            <div style={{
              background: "rgba(255,255,255,0.9)",
              borderLeft: `5px solid ${
                pr.status === "Approved" || pr.status === "Received" ? "#10b981" : "#ef4444"
              }`,
              borderRadius: '1.25rem',
              padding: '1.5rem',
              boxShadow: theme.shadow,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }} className="no-print">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.textPrimary, textTransform: 'uppercase' }}>
                  📋 Approval/Review Details
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '999px',
                  backgroundColor: 
                    pr.status === 'Approved' || pr.status === 'Received' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: 
                    pr.status === 'Approved' || pr.status === 'Received' ? '#10b981' : '#ef4444'
                }}>
                  {['ReturnedForRevision', 'Returned for Revision'].includes(pr.status) ? "Returned for Revision" : pr.status}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: theme.textPrimary }}>
                <strong>Remarks / Reasons:</strong>{" "}
                <span className="italic font-semibold">
                  "{pr.statusHistory?.[0]?.remarks 
                    || pr.remarks 
                    || "No remarks provided."}"
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>
                Reviewed by: {pr.statusHistory?.[0]?.changedByName || "Administrative Approver"} on {pr.statusHistory?.[0]?.createdAt ? new Date(pr.statusHistory[0].createdAt).toLocaleString() : "Date N/A"}
              </div>
            </div>
          )}

          {/* Requisition Details */}
          <div style={{
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: '1.25rem', padding: '1.5rem', boxShadow: theme.shadow
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.textPrimary, borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.75rem', margin: '0 0 1rem 0' }}>
              Purchase Request Master Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: theme.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>Department / Office</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.textPrimary }}>{pr.department} ({pr.office})</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: theme.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>Funding Source</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.textPrimary }}>{pr.fundingSource}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: theme.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>Assigned Procurement Officer</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.textPrimary }}>{pr.officerName}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', color: theme.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>Purpose / Justification</span>
                <span style={{ fontSize: '0.85rem', color: theme.textPrimary, lineHeight: 1.5 }}>{pr.purpose}</span>
              </div>
            </div>
          </div>

          {/* Requested Items Table */}
          <div style={{
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: '1.25rem', padding: '1.5rem', boxShadow: theme.shadow
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>
                Official Requisition Line Items
              </h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.crimson, backgroundColor: 'rgba(126,25,27,0.05)', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>
                Total Cost: ₱{pr.totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Description & Specifications</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Brand</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Quantity</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Est. Unit Cost</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {pr.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ fontWeight: 600, color: theme.textPrimary }}>{item.description}</div>
                        <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.2rem' }}>Specs: {item.specification}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: theme.textPrimary }}>{item.brand}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: theme.textPrimary }}>{item.quantity} {item.unit}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: theme.textPrimary }}>₱{item.estimatedUnitCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600, color: theme.textPrimary }}>₱{item.estimatedCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Budgets & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Department Budget Health check */}
          {deptBudget && (
            <div style={{
              background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: '1.25rem', padding: '1.5rem', boxShadow: theme.shadow
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.textPrimary, borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.75rem', margin: '0 0 1rem 0' }}>
                Department Budget Integrity
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: theme.textSecondary, fontWeight: 500 }}>Allocated Budget</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.textPrimary }}>₱{deptBudget.allocated.toLocaleString('en-PH')}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: theme.textSecondary, fontWeight: 500 }}>Spent Budget (incl. pending reservations)</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#b45309' }}>₱{deptBudget.spent.toLocaleString('en-PH')}</span>
                </div>
                <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '0.75rem' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: theme.textSecondary, fontWeight: 500 }}>Remaining Balance</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: remainingBudget >= pr.totalCost ? '#047857' : '#dc2626' }}>
                    ₱{remainingBudget.toLocaleString('en-PH')}
                  </span>
                  {remainingBudget < pr.totalCost && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.25rem' }}>
                      ⚠️ Requisition total exceeds remaining department balance.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Workflow status timeline progression */}
          <div style={{
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: '1.25rem', padding: '1.5rem', boxShadow: theme.shadow
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.textPrimary, borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.75rem', margin: '0 0 1rem 0' }}>
              Approval History Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem' }}>
              <div style={{ position: 'absolute', top: 5, bottom: 5, left: 5, width: 2, backgroundColor: theme.border }} />

              {pr.statusHistory.map((history, idx) => (
                <div key={history.id || idx} style={{ position: 'relative' }}>
                  {/* Dot identifier */}
                  <div style={{
                    position: 'absolute', left: '-1.85rem', top: '3px', width: 12, height: 12, borderRadius: '50%',
                    backgroundColor: 
                      history.status === 'Approved' ? '#10b981' :
                      ['ReturnedForRevision', 'Returned for Revision'].includes(history.status) ? '#ef4444' :
                      history.status === 'Rejected' ? '#7f1d1d' :
                      history.status === 'UnderReview' ? '#d97706' : 'var(--accent)',
                    border: '3px solid #fff',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                  }} />
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textPrimary }}>
                        {['ReturnedForRevision', 'Returned for Revision'].includes(history.status) ? 'Returned for Revision' :
                         history.status === 'UnderReview' ? 'Under Review' : history.status}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: theme.textSecondary }}>
                        {new Date(history.createdAt).toLocaleDateString()} {new Date(history.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.2rem' }}>
                      By: <strong>{history.changedByName}</strong>
                    </div>

                    <div style={{
                      fontSize: '0.75rem', color: theme.textPrimary, marginTop: '0.35rem',
                      padding: '0.5rem 0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(0,0,0,0.02)',
                      borderLeft: `3px solid ${theme.crimson}`, fontStyle: 'italic'
                    }}>
                      "{history.remarks}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Modal Overlay Dialog */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
          <div style={{
            background: '#fff', border: `1px solid ${theme.border}`,
            borderRadius: '1.25rem', width: '100%', maxWidth: '500px',
            padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            animation: 'zoomIn 0.2s ease-out'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
              {modalType === 'approve' ? 'Approve Purchase Request' : 
               modalType === 'return' ? 'Return Purchase Request for Revision' : 'Reject Purchase Request'}
            </h3>

            <p style={{ fontSize: '0.85rem', color: theme.textSecondary, margin: 0, lineHeight: 1.5 }}>
              {modalType === 'approve' 
                ? 'Are you sure you want to approve this purchase request? Optional remarks will be logged for the department requisitioner.'
                : 'Please specify the exact reasons for this action. Remarks are mandatory and will be visible in the requester tracking feed.'
              }
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textSecondary, textTransform: 'uppercase' }}>
                Remarks / Justification {(modalType === 'return' || modalType === 'reject') && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <textarea
                placeholder={modalType === 'approve' ? 'Optional approval notes...' : 'Specify reasons (specs incorrect, budget mismatch, etc.)...'}
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                rows={4}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                  border: `1px solid ${theme.border}`, outline: 'none',
                  fontSize: '0.85rem', resize: 'vertical', fontFamily: 'inherit'
                }}
              />
              {modalError && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                  ⚠️ {modalError}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: `1px solid ${theme.border}`,
                  background: '#fff', color: theme.textPrimary, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                style={{
                  padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none',
                  background: modalType === 'approve' ? 'linear-gradient(90deg, #10b981, #059669)' :
                             modalType === 'return' ? '#ef4444' : '#7f1d1d',
                  color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {modalType === 'approve' ? 'Approve PR' :
                 modalType === 'return' ? 'Return PR' : 'Reject PR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Government PR Layout Sheet (Appendix 60) */}
      <DocumentLayout title="PURCHASE REQUEST" documentRef={pr.prNumber} printAreaId="prPrintArea">
        <div id="prPrintArea" className="hidden bg-white border-2 border-slate-400 p-8 shadow-lg max-w-4xl mx-auto rounded-none font-mono text-slate-800 space-y-6" style={{ color: '#000', backgroundColor: '#fff' }}>
          
          {/* Header Box - hidden during print to prioritize official graphic header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800 print:hidden">
            <h2 className="text-sm font-bold uppercase tracking-wider">Appendix 60</h2>
            <h1 className="text-base font-extrabold uppercase">PURCHASE REQUEST</h1>
            <h3 className="text-sm font-black">BATANES STATE COLLEGE</h3>
            <p className="text-[10px] text-slate-500 font-bold">Basco, Batanes</p>
          </div>

          {/* Agency Metadata Grid */}
          <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[11px] font-bold">
            <div className="p-2 space-y-1">
              <div>Entity Name: <span className="font-extrabold underline">BATANES STATE COLLEGE</span></div>
              <div>Office/Section: <span className="underline">{pr.office || "Procurement Office"}</span></div>
            </div>
            <div className="p-2 space-y-1">
              <div>PR No.: <span className="font-extrabold underline">{pr.prNumber}</span></div>
              <div>Date: <span className="underline">{new Date(pr.requestDate).toLocaleDateString()}</span></div>
              <div>Fund Cluster: <span className="underline">{pr.fundingSource || "GAA"}</span></div>
            </div>
          </div>

          {/* Table Grid */}
          <div className="border border-slate-800 overflow-hidden">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-100 text-center font-extrabold divide-x divide-slate-800">
                  <th className="p-2 w-12">Item No</th>
                  <th className="p-2 w-16">Unit</th>
                  <th className="p-2">Item Description</th>
                  <th className="p-2 w-16">Qty</th>
                  <th className="p-2 w-28 text-right">Unit Cost</th>
                  <th className="p-2 w-28 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {pr.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-400 divide-x divide-slate-800 font-semibold text-[10px]">
                    <td className="p-2 text-center">{idx + 1}</td>
                    <td className="p-2 text-center">{item.unit}</td>
                    <td className="p-2">
                      <div className="font-extrabold">{item.description}</div>
                      {item.specification && (
                        <div className="text-[9px] text-slate-600 mt-0.5 whitespace-pre-wrap">{item.specification}</div>
                      )}
                    </td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right tabular-nums">₱{Number(item.estimatedUnitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right tabular-nums font-bold">₱{Number(item.estimatedCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {/* Purpose row */}
                <tr className="border-t border-slate-800 font-extrabold text-[11px]">
                  <td colSpan={6} className="p-3 bg-slate-50 text-left border-b border-slate-800">
                    Purpose: <span className="underline normal-case italic font-bold">{pr.purpose}</span>
                  </td>
                </tr>
                {/* Summary row */}
                <tr className="font-black text-xs">
                  <td colSpan={5} className="p-2 text-right uppercase">Total Estimated Budget:</td>
                  <td className="p-2 text-right tabular-nums text-red-700">₱{Number(pr.totalCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures block */}
          <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800 text-[11px] font-bold">
            <div className="p-4 space-y-4">
              <span>Requested By:</span>
              <div className="pt-6 text-center">
                <span className="block font-black underline uppercase">{pr.requesterName || "End-User planner"}</span>
                <span className="text-[9px] text-slate-500 font-bold">Designated Head, Requisition Unit</span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <span>Approved By:</span>
              <div className="pt-6 text-center">
                <span className="block font-black underline uppercase">Dr. President</span>
                <span className="text-[9px] text-slate-500 font-bold">Head of Procuring Entity (HOPE)</span>
              </div>
            </div>
          </div>

        </div>
      </DocumentLayout>

      {/* Basic Keyframe Animations injection */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
