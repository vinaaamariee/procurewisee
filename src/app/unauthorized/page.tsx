import { createClient } from '@/lib/supabase/server';
import { ROLE_HOME } from '@/types/auth';
import type { UserRole } from '@/types/auth';

export const metadata = { title: '403 Unauthorized — ProcureWise' };

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: UserRole | null = null;
  let fullName = '';

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, "fullName"')
      .eq('id', user.id)
      .single();
    if (profile) {
      role = profile.role as UserRole;
      fullName = profile.fullName;
    }
  }

  const dashboardLink = role ? ROLE_HOME[role] : '/';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg,#030712 0%,#0f172a 60%,#020617 100%)',
      padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '45%', aspectRatio: '1', borderRadius: '50%', background: 'rgba(239,68,68,0.06)', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '45%', aspectRatio: '1', borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(120px)', pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 480, width: '100%',
        borderRadius: 24,
        background: 'rgba(15,23,42,0.8)',
        border: '1px solid rgba(239,68,68,0.15)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Red accent top bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg,#ef4444,#f87171,#ef4444)' }} />

        <div style={{ padding: '2.5rem 2rem' }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
          }}>
            🔒
          </div>

          {/* 403 badge */}
          <div style={{
            display: 'inline-block', marginBottom: '1rem',
            padding: '0.25rem 0.75rem', borderRadius: 999,
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            fontSize: '0.7rem', fontWeight: 800, color: '#f87171',
            letterSpacing: '1px',
          }}>
            403 FORBIDDEN
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px', marginBottom: '0.75rem' }}>
            Access Denied
          </h1>

          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.7, marginBottom: '1.75rem' }}>
            {fullName ? `${fullName}, you don't` : "You don't"} have permission to access this section.
            {role && (
              <><br /><span style={{ color: '#475569' }}>Your role is </span>
              <span style={{ color: '#818cf8', fontWeight: 600 }}>{role}</span>.</>
            )}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href={dashboardLink} style={{
              display: 'block', padding: '0.75rem 1.5rem', borderRadius: 12,
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              color: '#fff', fontSize: '0.875rem', fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            }}>
              ← Back to My Dashboard
            </a>

            <form action="/api/auth/signout" method="post">
              <a href="/" style={{
                display: 'block', padding: '0.65rem 1.5rem', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#64748b', fontSize: '0.82rem', fontWeight: 500,
                textDecoration: 'none',
              }}>
                Sign in with a different account
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
