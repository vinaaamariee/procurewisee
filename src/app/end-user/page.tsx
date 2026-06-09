import { createClient } from '@/lib/supabase/server';
import { signout } from '../actions/auth';

export default async function EndUserDashboard(){
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-8">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">End-User Requisition Dashboard</h1>
          <p className="text-sm text-gray-500">Logged in as: {user?.email}</p>
        </div>
        <form action={signout}>
          <button type="submit" className="rounded-md border px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
            Sign Out
          </button>
        </form>
      </header>

      <main className="mt-6">
        <p className="text-gray-700">Welcome to your department workspace. Your procurement session is fully active.</p>
      </main>
    </div>
  );
}