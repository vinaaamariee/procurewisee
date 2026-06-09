import { login } from './actions/auth';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#030712] via-[#0f172a] to-[#020617] p-4 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/5 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-indigo-500 before:to-sky-400">
        
        {/* Subtle decorative glows */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative text-center">
          {/* Logo */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 font-black text-xl tracking-tight text-white shadow-xl shadow-indigo-500/20">
            <span>P</span>
            <span className="text-sky-200">W</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Welcome to ProcureWise
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to your institutional account
          </p>
        </div>

        <form action={login} className="relative space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@bsc.edu.ph"
              className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-950/80"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-950/80"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-medium text-red-400">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

