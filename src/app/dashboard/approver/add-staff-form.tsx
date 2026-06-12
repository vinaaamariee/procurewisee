'use client';

import { useState, useTransition } from 'react';
import { createStaffAccount } from '@/app/actions/users';

export default function AddStaffForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      setMessage(null);
      const result = await createStaffAccount(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Staff account created successfully!' });
        form.reset();
      } else {
        setMessage({ type: 'error', text: result.error || 'An error occurred' });
      }
    });
  };

  return (
    <div style={{ borderRadius: 16, background: 'rgba(15,23,42,0.65)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Add System User (Staff)</h2>
      </div>
      <div style={{ padding: '1.5rem' }}>
        {message && (
          <div style={{
            padding: '0.75rem', marginBottom: '1rem', borderRadius: 8, fontSize: '0.85rem',
            background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
            color: message.type === 'success' ? '#34d399' : '#f87171',
            border: `1px solid ${message.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`
          }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Full Name</label>
              <input name="fullName" type="text" required style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.85rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Username</label>
              <input name="username" type="text" required style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Email</label>
              <input name="email" type="email" required style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.85rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Password</label>
              <input name="password" type="password" required minLength={6} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>System Role</label>
            <select name="role" required style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: '0.85rem', outline: 'none', appearance: 'none' }}>
              <option value="Procurement Officer" style={{ color: 'black' }}>Procurement Officer</option>
              <option value="Administrative Approver" style={{ color: 'black' }}>Administrative Approver</option>
            </select>
          </div>
          <button type="submit" disabled={isPending} style={{
            marginTop: '0.5rem', padding: '0.65rem', borderRadius: 8, background: '#3b82f6', color: '#fff', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1
          }}>
            {isPending ? 'Creating Account...' : 'Create Staff Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
