'use client';

import { useTransition, useState } from 'react';
import { approveRecommendation } from '@/app/actions/recommendations';

interface ApproveButtonProps {
  recommId: number;
}

export default function ApproveButton({ recommId }: ApproveButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApprove = async () => {
    if (confirm('Are you sure you want to approve this recommendation?')) {
      startTransition(async () => {
        setErrorMsg(null);
        try {
          const result = await approveRecommendation(recommId);
          if (!result.success) {
            setErrorMsg(result.error || 'Failed to approve recommendation.');
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'An unexpected error occurred.');
        }
      });
    }
  };

  // Theme colors matching the dashboard
  const theme = {
    crimson: '#7e191b',
    goldDark: '#b88a1b',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
      <button
        onClick={handleApprove}
        disabled={isPending}
        style={{
          padding: '0.6rem 1.4rem',
          borderRadius: '999px',
          border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          background: isPending
            ? '#9ca3af'
            : `linear-gradient(90deg, ${theme.crimson} 0%, ${theme.goldDark} 100%)`,
          color: 'white',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: isPending ? 'none' : `0 4px 12px rgba(184, 138, 27, 0.25)`,
          opacity: isPending ? 0.7 : 1,
          transition: 'all 0.2s ease',
        }}
      >
        {isPending ? 'Approving...' : 'Approve'}
      </button>
      {errorMsg && (
        <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
          {errorMsg}
        </span>
      )}
    </div>
  );
}
