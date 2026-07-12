import { signout } from '@/app/actions/auth';
import { getAuthenticatedUser } from '@/lib/auth/get-user-profile';
import { ROLE_COLORS, ROLE_HOME } from '@/types/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/notifications/NotificationBell';

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
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Brand */}
          <a href={dashboardHome} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div className="h-10 w-10 bg-white dark:bg-[#1e293b] rounded-xl flex items-center justify-center text-[var(--accent)] font-black text-sm shadow-md border border-[var(--accent)]/20 shimmer-sweep flex-shrink-0">
              <span>P</span>
              <span className="text-[var(--secondary)]">W</span>
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
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.35rem 0.8rem', borderRadius: 999,
              background: 'var(--accent-glass)', border: '1px solid var(--border-accent)',
              fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800,
              letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)] animate-pulse" />
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
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0,
              }} className="flex items-center justify-center">
                {profile.fullName?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{profile.fullName}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{profile.email}</div>
              </div>
            </div>

            {/* Notification Bell */}
            <NotificationBell currentUser={profile} />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Sign Out */}
            <form action={signout}>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-transparent border border-red-500/20 hover:border-red-500/40 text-red-500 hover:bg-red-500/5 text-xs font-bold cursor-pointer transition-all duration-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Sub Navigation ── */}
      {(() => {
        const navLinks: Record<string, Array<{ label: string; href: string }>> = {
          'Procurement Officer': [
            { label: 'Overview', href: '/dashboard/officer' },
            { label: 'Purchase Requests', href: '/dashboard/officer/pr' },
            { label: 'Purchase Orders', href: '/dashboard/officer/po' },
            { label: 'Analytics', href: '/dashboard/officer/analytics' },
          ],
          'Administrative Approver': [
            { label: 'Overview', href: '/dashboard/approver' },
            { label: 'Analytics', href: '/dashboard/approver/analytics' },
          ],
          'End User': [
            { label: 'Overview', href: '/dashboard/end-user' },
            { label: 'My PPMPs', href: '/dashboard/end-user/ppmp' },
            { label: 'Purchase Requests', href: '/dashboard/end-user/pr' },
          ],
        };
        const links = navLinks[profile.role] || [];
        if (links.length === 0) return null;
        return (
          <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <style dangerouslySetInnerHTML={{ __html: `
              .nav-sub-link {
                font-size: 0.8rem;
                font-weight: 600;
                color: var(--text-secondary);
                text-decoration: none;
                transition: all 0.2s;
                position: relative;
                padding: 0.5rem 0.25rem;
              }
              .nav-sub-link:hover {
                color: var(--accent) !important;
              }
            ` }} />
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '1.5rem', height: 44, alignItems: 'center' }}>
              {links.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="nav-sub-link"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        );
      })()}

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
