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
    <div style={{ borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Add System User (Staff)</h2>
      </div>
      <div style={{ padding: '1.5rem' }}>
        {message && (
          <div style={{
            padding: '0.75rem', marginBottom: '1rem', borderRadius: 8, fontSize: '0.85rem',
            background: message.type === 'success' ? 'var(--green-dim)' : 'var(--red-dim)',
            color: message.type === 'success' ? 'var(--green)' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? 'var(--green)' : '#ef4444'}`
          }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
              <input name="fullName" type="text" required style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Username</label>
              <input name="username" type="text" required style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
              <input name="email" type="email" required style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
              <input name="password" type="password" required minLength={6} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>System Role</label>
            <select name="role" required style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', appearance: 'none' }}>
              <option value="Procurement Officer" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>Procurement Officer</option>
              <option value="Administrative Approver" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>Administrative Approver</option>
            </select>
          </div>
          <button type="submit" disabled={isPending} style={{
            marginTop: '0.5rem', padding: '0.65rem', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1
          }}>
            {isPending ? 'Creating Account...' : 'Create Staff Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
