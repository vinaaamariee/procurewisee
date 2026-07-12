import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Let's use the first user's ID
  const testEmail = 'test123@gmail.com';
  console.log(`Starting performance timing comparison for ${testEmail}...`);

  // Get User ID via Supabase sign-in
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: 'password123',
  });

  if (!authData?.user) {
    console.error('Test user login failed. Ensure test123@gmail.com / password123 exists.');
    return;
  }
  const userId = authData.user.id;

  // Measure Supabase REST Client profile fetch
  console.time('Supabase REST Client Fetch');
  const { data: profileSupabase } = await supabase
    .from('user_profiles')
    .select('id, username, "fullName", email, role, "isActive", "createdAt"')
    .eq('id', userId)
    .single();
  console.timeEnd('Supabase REST Client Fetch');

  // Measure Prisma Client fetch
  console.time('Prisma Client Fetch (Pooled)');
  const profilePrisma = await prisma.userProfile.findUnique({
    where: { id: userId }
  });
  console.timeEnd('Prisma Client Fetch (Pooled)');

  console.log('Results match:', profileSupabase?.username === profilePrisma?.username);
}

run().then(() => prisma.$disconnect());
