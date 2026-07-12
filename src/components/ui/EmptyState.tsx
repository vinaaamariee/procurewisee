import React from 'react';

export interface EmptyStateProps {
  /** Large SVG illustration — choose from predefined presets or pass 'custom' */
  preset:
    | 'purchase-requests'
    | 'purchase-orders'
    | 'rfq'
    | 'evaluations'
    | 'reports'
    | 'ppmp'
    | 'suppliers'
    | 'search'
    | 'departments'
    | 'audit'
    | 'generic';
  title: string;
  description: string;
  /** Optional primary CTA */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Optional compact mode for inline empty states (e.g. inside a card) */
  compact?: boolean;
}

/* ─── SVG Illustrations per preset ─── */
const illustrations: Record<EmptyStateProps['preset'], React.ReactNode> = {
  'purchase-requests': (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#pr-bg)" opacity="0.12" />
      <rect x="30" y="28" width="60" height="72" rx="8" fill="url(#pr-card)" opacity="0.25" />
      <rect x="30" y="22" width="60" height="72" rx="8" fill="url(#pr-card)" opacity="0.5" />
      <rect x="38" y="34" width="44" height="5" rx="2.5" fill="currentColor" opacity="0.35" />
      <rect x="38" y="45" width="32" height="4" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="38" y="54" width="38" height="4" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="38" y="63" width="28" height="4" rx="2" fill="currentColor" opacity="0.2" />
      <circle cx="86" cy="82" r="18" fill="url(#pr-badge)" />
      <path d="M79 82l4.5 4.5 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="pr-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="pr-card" x1="30" y1="22" x2="90" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="pr-badge" x1="68" y1="64" x2="104" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" /><stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  ),

  'purchase-orders': (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#po-bg)" opacity="0.1" />
      <rect x="22" y="40" width="76" height="50" rx="8" fill="url(#po-box)" opacity="0.2" />
      <rect x="22" y="35" width="76" height="50" rx="8" fill="url(#po-box)" opacity="0.45" />
      <path d="M22 47h76" stroke="url(#po-stripe)" strokeWidth="2" opacity="0.4" />
      <rect x="32" y="55" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
      <rect x="32" y="62" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <rect x="32" y="69" width="25" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <rect x="68" y="55" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
      <rect x="68" y="62" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <path d="M46 24 L60 16 L74 24 L74 36 L60 44 L46 36Z" fill="url(#po-tag)" opacity="0.7" />
      <defs>
        <linearGradient id="po-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" /><stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="po-box" x1="22" y1="35" x2="98" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="po-stripe" x1="22" y1="47" x2="98" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="po-tag" x1="46" y1="16" x2="74" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  ),

  rfq: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#rfq-bg)" opacity="0.1" />
      <circle cx="60" cy="52" r="28" fill="none" stroke="url(#rfq-ring)" strokeWidth="3" strokeDasharray="6 4" opacity="0.5" />
      <circle cx="60" cy="52" r="18" fill="url(#rfq-inner)" opacity="0.35" />
      <path d="M54 48 L60 40 L66 48 L64 56 H56 L54 48Z" fill="url(#rfq-bolt)" opacity="0.8" />
      <path d="M34 84 Q60 72 86 84" stroke="url(#rfq-wave)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.45" />
      <path d="M28 92 Q60 78 92 92" stroke="url(#rfq-wave)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.25" />
      <defs>
        <linearGradient id="rfq-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="rfq-ring" x1="32" y1="24" x2="88" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="rfq-inner" x1="42" y1="34" x2="78" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="rfq-bolt" x1="54" y1="40" x2="66" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="rfq-wave" x1="28" y1="84" x2="92" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
      </defs>
    </svg>
  ),

  evaluations: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#ev-bg)" opacity="0.1" />
      <path d="M60 24L65.9 42.1H85L69.5 52.6L75.5 70.7L60 60.2L44.5 70.7L50.5 52.6L35 42.1H54.1L60 24Z" fill="url(#ev-star)" opacity="0.7" />
      <path d="M60 28L64.7 43.2H80.6L68 51.4L72.7 66.5L60 58.3L47.3 66.5L52 51.4L39.4 43.2H55.3L60 28Z" fill="url(#ev-star-inner)" opacity="0.9" />
      <rect x="30" y="80" width="60" height="6" rx="3" fill="url(#ev-bar)" opacity="0.3" />
      <rect x="30" y="80" width="36" height="6" rx="3" fill="url(#ev-bar)" opacity="0.75" />
      <circle cx="30" cy="83" r="4" fill="#f59e0b" opacity="0.9" />
      <defs>
        <linearGradient id="ev-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="ev-star" x1="35" y1="24" x2="85" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" /><stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="ev-star-inner" x1="39" y1="28" x2="81" y2="67" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" /><stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="ev-bar" x1="30" y1="83" x2="90" y2="83" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  ),

  reports: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#rp-bg)" opacity="0.1" />
      <rect x="25" y="30" width="70" height="62" rx="8" fill="url(#rp-card)" opacity="0.2" />
      <rect x="25" y="26" width="70" height="62" rx="8" fill="url(#rp-card)" opacity="0.4" />
      <rect x="33" y="38" width="16" height="34" rx="3" fill="url(#rp-bar1)" />
      <rect x="54" y="48" width="16" height="24" rx="3" fill="url(#rp-bar2)" />
      <rect x="75" y="42" width="14" height="30" rx="3" fill="url(#rp-bar3)" />
      <path d="M33 36 L41 44 L54 38 L70 42 L82 36" stroke="url(#rp-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
      <defs>
        <linearGradient id="rp-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="rp-card" x1="25" y1="26" x2="95" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="rp-bar1" x1="33" y1="38" x2="49" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="rp-bar2" x1="54" y1="48" x2="70" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4a035" /><stop offset="1" stopColor="#7e191b" />
        </linearGradient>
        <linearGradient id="rp-bar3" x1="75" y1="42" x2="89" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" opacity="0.7" />
        </linearGradient>
        <linearGradient id="rp-line" x1="33" y1="36" x2="82" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  ),

  ppmp: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#pp-bg)" opacity="0.1" />
      <rect x="28" y="24" width="64" height="76" rx="8" fill="url(#pp-card)" opacity="0.2" />
      <rect x="28" y="20" width="64" height="76" rx="8" fill="url(#pp-card)" opacity="0.45" />
      <rect x="36" y="32" width="48" height="6" rx="3" fill="currentColor" opacity="0.4" />
      <rect x="36" y="44" width="8" height="8" rx="2" fill="url(#pp-check)" />
      <rect x="48" y="46" width="30" height="4" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="36" y="57" width="8" height="8" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="48" y="59" width="24" height="4" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="36" y="70" width="8" height="8" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="48" y="72" width="36" height="4" rx="2" fill="currentColor" opacity="0.2" />
      <path d="M76 68 L82 74 L92 60" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="pp-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" /><stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="pp-card" x1="28" y1="20" x2="92" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="pp-check" x1="36" y1="44" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" /><stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  ),

  suppliers: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#sp-bg)" opacity="0.1" />
      <rect x="24" y="50" width="72" height="44" rx="8" fill="url(#sp-building)" opacity="0.4" />
      <rect x="32" y="38" width="56" height="16" rx="4" fill="url(#sp-building)" opacity="0.5" />
      <rect x="42" y="28" width="36" height="14" rx="4" fill="url(#sp-roof)" opacity="0.6" />
      <rect x="36" y="62" width="12" height="16" rx="2" fill="white" opacity="0.3" />
      <rect x="54" y="62" width="12" height="16" rx="2" fill="white" opacity="0.3" />
      <rect x="72" y="62" width="12" height="16" rx="2" fill="white" opacity="0.3" />
      <rect x="47" y="78" width="26" height="16" rx="2" fill="white" opacity="0.2" />
      <defs>
        <linearGradient id="sp-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" /><stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="sp-building" x1="24" y1="38" x2="96" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="sp-roof" x1="42" y1="28" x2="78" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4a035" /><stop offset="1" stopColor="#7e191b" />
        </linearGradient>
      </defs>
    </svg>
  ),

  search: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#sr-bg)" opacity="0.1" />
      <circle cx="52" cy="50" r="22" fill="none" stroke="url(#sr-ring)" strokeWidth="5" opacity="0.5" />
      <line x1="68" y1="66" x2="86" y2="84" stroke="url(#sr-handle)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="52" cy="50" r="10" fill="url(#sr-lens)" opacity="0.25" />
      <defs>
        <linearGradient id="sr-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="sr-ring" x1="30" y1="28" x2="74" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="sr-handle" x1="68" y1="66" x2="86" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4a035" /><stop offset="1" stopColor="#7e191b" />
        </linearGradient>
        <linearGradient id="sr-lens" x1="42" y1="40" x2="62" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
      </defs>
    </svg>
  ),

  departments: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#dp-bg)" opacity="0.1" />
      <rect x="20" y="52" width="80" height="44" rx="6" fill="url(#dp-base)" opacity="0.3" />
      <rect x="30" y="38" width="60" height="18" rx="5" fill="url(#dp-mid)" opacity="0.4" />
      <rect x="42" y="28" width="36" height="14" rx="5" fill="url(#dp-top)" opacity="0.5" />
      <line x1="60" y1="28" x2="60" y2="22" stroke="url(#dp-flag)" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 22 L70 25 L60 28Z" fill="url(#dp-flag)" opacity="0.8" />
      <defs>
        <linearGradient id="dp-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="dp-base" x1="20" y1="52" x2="100" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="dp-mid" x1="30" y1="38" x2="90" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c4a035" /><stop offset="1" stopColor="#7e191b" />
        </linearGradient>
        <linearGradient id="dp-top" x1="42" y1="28" x2="78" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="dp-flag" x1="60" y1="22" x2="70" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  ),

  audit: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#au-bg)" opacity="0.1" />
      <rect x="26" y="26" width="68" height="76" rx="8" fill="url(#au-doc)" opacity="0.35" />
      <rect x="34" y="38" width="52" height="4" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="34" y="48" width="40" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <rect x="34" y="56" width="46" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
      <circle cx="84" cy="84" r="20" fill="white" opacity="0.1" />
      <path d="M76 84l5 5 10-10" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="au-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="au-doc" x1="26" y1="26" x2="94" y2="102" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
      </defs>
    </svg>
  ),

  generic: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="url(#gn-bg)" opacity="0.1" />
      <circle cx="60" cy="52" r="24" fill="url(#gn-circle)" opacity="0.25" />
      <path d="M60 40 v12 M60 58 v4" stroke="url(#gn-excl)" strokeWidth="4" strokeLinecap="round" />
      <rect x="28" y="86" width="64" height="8" rx="4" fill="url(#gn-bar)" opacity="0.25" />
      <defs>
        <linearGradient id="gn-bg" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="gn-circle" x1="36" y1="28" x2="84" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="gn-excl" x1="60" y1="40" x2="60" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
        <linearGradient id="gn-bar" x1="28" y1="90" x2="92" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e191b" /><stop offset="1" stopColor="#c4a035" />
        </linearGradient>
      </defs>
    </svg>
  ),
};

export default function EmptyState({
  preset,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  const illus = illustrations[preset];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '2rem 1.5rem' : '4rem 2rem',
        textAlign: 'center',
        gap: compact ? '0.75rem' : '1.25rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '1.25rem',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Illustration */}
      <div
        style={{
          width: compact ? 80 : 120,
          height: compact ? 80 : 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          transform: compact ? 'scale(0.67)' : 'scale(1)',
          transformOrigin: 'center',
          marginBottom: compact ? '-1rem' : 0,
        }}
      >
        {illus}
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: 380 }}>
        <h3
          style={{
            margin: 0,
            fontSize: compact ? '0.95rem' : '1.1rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: compact ? '0.75rem' : '0.82rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      </div>

      {/* Action Button */}
      {action && (
        action.href ? (
          <a
            href={action.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.4rem',
              borderRadius: '0.65rem',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.8rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(126,25,27,0.25)',
              transition: 'all 0.2s ease',
            }}
            className="hover:opacity-90 hover:-translate-y-px"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.4rem',
              borderRadius: '0.65rem',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(126,25,27,0.25)',
              transition: 'all 0.2s ease',
            }}
            className="hover:opacity-90 hover:-translate-y-px"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
