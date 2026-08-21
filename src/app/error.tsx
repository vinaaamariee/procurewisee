'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[NEXT APP ERROR DIAGNOSTIC]:', error);
  }, [error]);

  const isAuthError =
    error.message?.includes('Authentication failed') ||
    error.message?.includes('P1000') ||
    error.message?.includes('credentials');

  const isConnError =
    error.message?.includes('P1001') ||
    error.message?.includes('Can\'t reach database server');

  return (
    <div className="min-h-screen bg-[#0D0E12] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-[#141519] border border-[var(--border-accent)] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--border-accent)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-glass)] border border-[var(--border-accent)] flex items-center justify-center text-[var(--accent)] text-xl font-bold">
            ⚠️
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {isAuthError
                ? 'Database Authentication Failed (P1000)'
                : isConnError
                ? 'Database Connection Timeout (P1001)'
                : 'Application Error Occurred'}
            </h1>
            <p className="text-xs text-slate-400">
              ProcureWise — System Diagnostic Gateway
            </p>
          </div>
        </div>

        {isAuthError ? (
          <div className="space-y-3 text-xs text-slate-300">
            <p className="leading-relaxed">
              The PostgreSQL database server rejected the credentials specified in your environment configuration (<code className="text-[var(--secondary)] font-mono">DATABASE_URL</code>).
            </p>
            <div className="p-3.5 bg-[var(--accent-glass)] border border-[var(--border-accent)] rounded-xl text-[var(--accent)] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all">
              {error.message || 'Error P1000: Authentication failed against database server for user "postgres".'}
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-slate-300">
              <div className="font-bold text-[var(--secondary)] uppercase tracking-wide text-[11px]">
                🔧 Resolution Steps:
              </div>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
                <li>Verify your database password in <code className="text-white">.env</code> (local) and Vercel Environment Variables (production).</li>
                <li>Ensure <code className="text-white">DATABASE_URL</code> uses the active Supabase password for tenant <code className="text-white">postgres.[project_ref]</code>.</li>
                <li>If the password was changed or reset on Supabase, update the connection string and restart the server.</li>
              </ol>
            </div>
          </div>
        ) : isConnError ? (
          <div className="space-y-3 text-xs text-slate-300">
            <p className="leading-relaxed">
              Unable to connect to the database server. This usually happens when connecting directly to an IPv6 address or when pooler host is unreachable.
            </p>
            <div className="p-3.5 bg-[var(--accent-glass)] border border-[var(--border-accent)] rounded-xl text-[var(--accent)] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all">
              {error.message}
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-slate-300">
            <p className="leading-relaxed">
              An unhandled server exception occurred while rendering this route.
            </p>
            <div className="p-3.5 bg-[var(--accent-glass)] border border-[var(--border-accent)] rounded-xl text-[var(--accent)] font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
              {error.message || 'Unknown Server Error'}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-[#7B1E1E] text-white text-xs font-bold hover:bg-[#922424] transition cursor-pointer"
          >
            🔄 Reload / Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
          >
            🏠 Return to Portal Home
          </button>
        </div>
      </div>
    </div>
  );
}
