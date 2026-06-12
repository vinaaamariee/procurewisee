import { signout } from '@/app/actions/auth';
import { getAuthenticatedUser } from '@/lib/auth/get-user-profile';
import { ROLE_COLORS, ROLE_HOME } from '@/types/auth';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getAuthenticatedUser();
  const roleColor = ROLE_COLORS[profile.role];
  const dashboardHome = ROLE_HOME[profile.role];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, var(--bg-deep) 0%, var(--bg-dark) 100%)' }}>
      {/* ── Top Navigation Bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 0 rgba(56,189,248,0.04)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Brand */}
          <a href={dashboardHome} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '0.8rem', color: '#fff',
              boxShadow: '0 0 16px rgba(99,102,241,0.25)',
              flexShrink: 0,
            }}>
              <span>P</span><span style={{ color: '#bae6fd' }}>W</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>ProcureWise</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Batanes State College</div>
            </div>
          </a>

          {/* Right side: role badge + user + theme toggle + signout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Role Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.3rem 0.75rem', borderRadius: 999,
              background: roleColor.bg, border: `1px solid ${roleColor.border}`,
              fontSize: '0.7rem', color: roleColor.text, fontWeight: 700,
              letterSpacing: '0.3px', whiteSpace: 'nowrap',
            }}>
              <span>●</span>
              {profile.role}
            </div>

            {/* User info */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.35rem 0.75rem 0.35rem 0.5rem',
              borderRadius: 999, background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#38bdf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>
                {profile.fullName?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.fullName}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{profile.email}</div>
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Sign Out */}
            <form action={signout}>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[11px] font-semibold cursor-pointer transition-colors duration-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
      }}>
        ProcureWise &nbsp;·&nbsp; Batanes State College &nbsp;·&nbsp; Procurement Management System
      </footer>
    </div>
  );
}
