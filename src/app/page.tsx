import { login } from './actions/auth';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#030712] px-4 py-12 selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* Background gradients/glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-[420px] rounded-2xl border border-white/5 bg-slate-900/50 p-8 backdrop-blur-xl shadow-2xl z-10">
        {/* Accent top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 font-extrabold text-xl text-white shadow-xl shadow-indigo-500/20 mb-4">
            <span>P</span>
            <span className="text-sky-200">W</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome to ProcureWise
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to your institutional account
          </p>
        </div>

        {/* Auth Form */}
        <form action={login} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@bsc.edu.ph"
              className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition duration-150 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-950/80"
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
              className="w-full rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition duration-150 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-950/80"
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
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/15 hover:from-indigo-600 hover:to-indigo-700 transition duration-150 active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}


