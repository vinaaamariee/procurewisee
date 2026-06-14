import 'dotenv/config';
import { createServerClient } from '@supabase/ssr';

// Mock the cookies store
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

  console.log(`Signing in as ${email}...`);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Sign in error:', error);
    return;
  }

  console.log('Sign in success! Cookies set:');
  console.log(store.cookies);
}

run().catch(console.error);
