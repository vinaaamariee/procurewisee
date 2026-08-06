import Image from 'next/image';
import { getAuthenticatedUser } from '@/lib/auth/get-user-profile';
import { ROLE_HOME, ROLE_LABELS } from '@/types/auth';
import { signout } from '@/app/actions/auth';
import { Lock, ShieldAlert, UserCheck, LogOut, ArrowLeft } from 'lucide-react';

export const metadata = { title: '403 Access Denied — ProcureWise' };

interface PageProps {
  searchParams: Promise<{ required?: string }>;
}

export default async function UnauthorizedPage({ searchParams }: PageProps) {
  // getAuthenticatedUser checks auth and redirects to /login if unauthenticated
  const { profile } = await getAuthenticatedUser();
  
  const params = await searchParams;
  const requiredRole = params.required || 'Authorized Role';
  const dashboardLink = ROLE_HOME[profile.role] || '/';

  return (
    <div
      data-theme="bsc"
      className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-base-content selection:bg-[#7B1E1E]/20 p-4 sm:p-6 relative overflow-hidden"
    >
      {/* Background radial glow accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#7B1E1E]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#A6761D]/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* daisyUI Card component */}
        <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden rounded-2xl">
          {/* Maroon/gold accent top bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#7B1E1E] via-[#A6761D] to-[#7B1E1E]" />

          <div className="card-body p-7 sm:p-9 space-y-6 text-center">
            {/* Lock Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7B1E1E]/10 text-[#7B1E1E] mx-auto border border-[#7B1E1E]/20 shadow-sm">
              <Lock className="h-7 w-7" />
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
              <span className="badge badge-outline border-error/30 text-error text-[10px] font-extrabold uppercase tracking-widest px-3 py-2.5">
                403 Access Denied
              </span>
              <h1 className="text-2xl font-black text-[#7B1E1E] tracking-tight leading-none pt-1">
                Access Restricted
              </h1>
              <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-normal">
                Your account is successfully authenticated, but you don't have permission to access this page.
              </p>
            </div>

            {/* Role Comparison Table Box */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-base-200/60 border border-base-200 text-left">
              {/* Current Role */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-base-content/50 block">
                  Current Role
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-base-content">
                  <UserCheck className="h-4 w-4 text-[#A6761D] flex-shrink-0" />
                  <span className="truncate">{ROLE_LABELS[profile.role] || profile.role}</span>
                </div>
              </div>

              {/* Required Role */}
              <div className="space-y-1 border-l border-base-300 pl-4">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-base-content/50 block">
                  Required Role
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-error">
                  <ShieldAlert className="h-4 w-4 text-error flex-shrink-0" />
                  <span className="truncate">{ROLE_LABELS[requiredRole as keyof typeof ROLE_LABELS] || requiredRole}</span>
                </div>
              </div>
            </div>

            {/* Support Message */}
            <p className="text-xs text-base-content/60 leading-relaxed max-w-sm mx-auto">
              If you believe you should have access to this resource, please contact your System Administrator or the Procurement Office.
            </p>

            {/* Actions Button List */}
            <div className="space-y-2 pt-2">
              {/* Back to Dashboard */}
              <a
                href={dashboardLink}
                className="btn btn-primary w-full text-white font-bold bg-[#7B1E1E] hover:bg-[#601717] border-none shadow-sm text-sm rounded-xl flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </a>

              {/* Sign out Form */}
              <form action={signout} className="w-full">
                <button
                  type="submit"
                  className="btn btn-outline w-full border-base-300 hover:bg-base-200 text-base-content/85 hover:text-base-content font-bold text-sm rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign in with a different account</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-6 flex flex-col items-center justify-center gap-3">
          <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-base-200 shadow-sm p-1">
            <Image
              src="/images/bsc-logo.png"
              alt="BSC Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <p className="text-[11px] text-base-content/40 font-medium text-center">
            © {new Date().getFullYear()} Batanes State College · Powered by ProcureWise
          </p>
        </div>
      </div>
    </div>
  );
}
