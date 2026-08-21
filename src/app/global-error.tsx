'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[NEXT GLOBAL ERROR DIAGNOSTIC]:', error);
  }, [error]);

  const isAuthError =
    error.message?.includes('Authentication failed') ||
    error.message?.includes('P1000') ||
    error.message?.includes('credentials');

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#161616] text-gray-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full bg-[#161616] border border-[var(--border-accent)] rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-accent)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-glass)] border border-[var(--border-accent)] flex items-center justify-center text-[var(--accent)] text-xl font-bold">
              âš ï¸
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {isAuthError
                  ? 'Database Authentication Error (P1000)'
                  : 'Server Critical Error'}
              </h1>
              <p className="text-xs text-gray-400">
                ProcureWise â€” System Diagnostic Gateway
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <p className="leading-relaxed">
              {isAuthError
                ? 'Database authentication failed. The database server rejected the credentials in DATABASE_URL.'
                : 'A critical server error occurred while rendering the application.'}
            </p>
            <div className="p-3.5 bg-[var(--accent-glass)] border border-[var(--border-accent)] rounded-xl text-[var(--accent)] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all">
              {error.message || 'Unknown Server Exception'}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-xl bg-[#800000] text-white text-xs font-bold hover:bg-[#800000] transition cursor-pointer"
            >
              ðŸ”„ Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
