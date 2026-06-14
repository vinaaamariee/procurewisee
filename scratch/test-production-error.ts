import 'dotenv/config';
import { createServerClient } from '@supabase/ssr';

class MockCookieStore {
  cookies: Record<string, string> = {};
  getAll() {
    return Object.entries(this.cookies).map(([name, value]) => ({ name, value }));
  }
  set(name: string, value: string, options: any) {
    this.cookies[name] = value;
  }
  get(name: string) {
    return { name, value: this.cookies[name] };
  }
}

async function run() {
  const store = new MockCookieStore();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            store.set(name, value, options);
          });
        }
      }
    }
  );

  const email = 'officer3@procurewise.local';
  const password = 'password123';

  console.log(`[TEST] Logging in to Supabase as ${email}...`);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('[TEST] Sign in error:', error);
    return;
  }

  // Construct cookie header from store
  const cookieHeader = Object.entries(store.cookies)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');

  console.log('[TEST] Cookie Header generated from Mock Store successfully.');

  // Fetch /dashboard/officer
  console.log('\n[TEST] Requesting /dashboard/officer...');
  const resOfficer = await fetch('http://localhost:3001/dashboard/officer', {
    headers: {
      Cookie: cookieHeader,
    },
    redirect: 'manual',
  });

  console.log('[TEST] /dashboard/officer status:', resOfficer.status);
  console.log('[TEST] Headers:', Object.fromEntries(resOfficer.headers.entries()));
  if (resOfficer.status === 200) {
    const text = await resOfficer.text();
    console.log('[TEST] Response contains HTML (length):', text.length);
  }

  // Fetch /dashboard/catalog
  console.log('\n[TEST] Requesting /dashboard/catalog...');
  const resCatalog = await fetch('http://localhost:3001/dashboard/catalog', {
    headers: {
      Cookie: cookieHeader,
    },
    redirect: 'manual',
  });

  console.log('[TEST] /dashboard/catalog status:', resCatalog.status);
  console.log('[TEST] Headers:', Object.fromEntries(resCatalog.headers.entries()));
  if (resCatalog.status === 200) {
    const text = await resCatalog.text();
    console.log('[TEST] Response contains HTML (length):', text.length);
  } else {
    const text = await resCatalog.text();
    console.log('[TEST] Response text:', text);
  }
}

run().catch(console.error);
