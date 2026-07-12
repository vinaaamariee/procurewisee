import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../src/lib/prisma';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function run() {
  const userId = 'e4dceec0-2884-48bd-81f0-9320b5411658'; // mags
  
  console.log('--- WARM UP ---');
  const supabase = createClient(supabaseUrl, supabaseKey);
  await supabase.from('user_profiles').select('id, role').eq('id', userId).single();
  await prisma.userProfile.findUnique({ where: { id: userId } });
  
  console.log('--- MEASURING ---');
  
  console.time('Supabase JS query');
  const { data: sbProfile } = await supabase
    .from('user_profiles')
    .select('id, username, fullName, email, role, isActive, createdAt')
    .eq('id', userId)
    .single();
  console.timeEnd('Supabase JS query');
  
  console.time('Prisma query');
  const prismaProfile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    }
  });
  console.timeEnd('Prisma query');

  console.log('Supabase result role:', sbProfile?.role);
  console.log('Prisma result role:', prismaProfile?.role);
}

run().then(() => prisma.$disconnect());
