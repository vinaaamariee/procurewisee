import { getRecentActivity, ActivityItem } from '@/app/actions/activity';
import EmptyState from '@/components/ui/EmptyState';

const CATEGORY_COLOR: Record<ActivityItem['category'], { bg: string; text: string; border: string }> = {
  pr:         { bg: 'rgba(220,179,83,0.12)',   text: '#b88a1b', border: 'rgba(220,179,83,0.3)' },
  rfq:        { bg: 'rgba(79,70,229,0.10)',     text: '#4f46e5', border: 'rgba(79,70,229,0.2)' },
  po:         { bg: 'rgba(16,185,129,0.10)',    text: '#059669', border: 'rgba(16,185,129,0.2)' },
  quote:      { bg: 'rgba(59,130,246,0.10)',    text: '#2563eb', border: 'rgba(59,130,246,0.2)' },
  evaluation: { bg: 'rgba(245,158,11,0.12)',    text: '#d97706', border: 'rgba(245,158,11,0.25)' },
  general:    { bg: 'rgba(107,114,128,0.08)',   text: '#6b7280', border: 'rgba(107,114,128,0.2)' },
};

// Avatar colours cycle for users with no photo
const AVATAR_PALETTE = [
  '#7e191b', '#4f46e5', '#059669', '#d97706', '#2563eb', '#7c3aed', '#0891b2',
];
function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

interface ActivityFeedProps {
  limit?: number;
  /** Show a compact, scrollable panel version instead of full-width */
  compact?: boolean;
}

export default async function ActivityFeed({ limit = 12, compact = false }: ActivityFeedProps) {
  const items = await getRecentActivity(limit);

  return (
    <div
      id="activity-feed"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(30,58,138,0.07)',
        display: 'flex',
        flexDirection: 'column',
        scrollMarginTop: '5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Animated pulse dot */}
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
              animation: 'pulse 2s infinite',
            }}
          />
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Recent Activity
          </h2>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'rgba(0,0,0,0.04)',
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
          }}
        >
          Live feed · Last {items.length} events
        </span>
      </div>

      {/* Feed body */}
      <div
        style={{
          overflowY: 'auto',
          maxHeight: compact ? '400px' : '580px',
          padding: items.length === 0 ? '0' : '0.25rem 0',
        }}
      >
        {items.length === 0 ? (
          <div style={{ padding: '1rem' }}>
            <EmptyState
              preset="audit"
              title="No Activity Yet"
              description="System events will appear here as procurement actions are performed — submitted requests, published RFQs, generated purchase orders, and more."
              compact
            />
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: '0.5rem 0' }}>
            {items.map((item, idx) => {
              const colors = CATEGORY_COLOR[item.category];
              const bgColor = avatarColor(item.userName);
              const isLast = idx === items.length - 1;

              return (
                <li
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '0.9rem 1.5rem',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                  }}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  {/* Timeline connector line */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: '2.85rem',
                        top: '3.25rem',
                        bottom: 0,
                        width: 2,
                        background: 'var(--border)',
                        borderRadius: 1,
                      }}
                    />
                  )}

                  {/* Avatar */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: bgColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      letterSpacing: '0.02em',
                      position: 'relative',
                      zIndex: 1,
                    }}
                    title={item.userName}
                  >
                    {item.userInitials}
                    {/* Event icon badge */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -3,
                        right: -4,
                        fontSize: '0.75rem',
                        lineHeight: 1,
                        background: 'var(--surface)',
                        borderRadius: '50%',
                        padding: '1px',
                      }}
                    >
                      {item.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Category badge + title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            padding: '0.12rem 0.45rem',
                            borderRadius: '4px',
                            background: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                            flexShrink: 0,
                          }}
                        >
                          {item.category === 'pr'         ? 'Purchase Request'
                          : item.category === 'rfq'       ? 'RFQ'
                          : item.category === 'po'        ? 'Purchase Order'
                          : item.category === 'quote'     ? 'Supplier Quote'
                          : item.category === 'evaluation'? 'Evaluation'
                          : 'System'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '260px',
                          }}
                        >
                          {item.title}
                        </span>
                      </div>

                      {/* Relative time */}
                      <time
                        dateTime={item.timestamp}
                        title={item.timestamp}
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.relativeTime}
                      </time>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.description}
                    >
                      {item.description}
                    </p>

                    {/* User tag */}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      by&nbsp;<strong style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{item.userName}</strong>
                      &nbsp;·&nbsp;{item.timestamp}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing the latest {items.length} system events · Auto-refreshes on page load
          </span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
          50%       { box-shadow: 0 0 0 6px rgba(16,185,129,0.08); }
        }
      `}</style>
    </div>
  );
}
