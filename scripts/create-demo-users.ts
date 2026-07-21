import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';
import { prisma } from '../src/lib/prisma';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tfswokhkuxwvpcpxekso.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

const DEMO_ACCOUNTS = [
  {
    email: 'officer@bsc.edu.ph',
    password: 'Password123!',
    username: 'bsc_officer',
    fullName: 'Procurement Officer Admin',
    role: 'ProcurementOfficer' as const,
  },
  {
    email: 'approver@bsc.edu.ph',
    password: 'Password123!',
    username: 'bsc_approver',
    fullName: 'Administrative Approver',
    role: 'AdministrativeApprover' as const,
  },
  {
    email: 'enduser@bsc.edu.ph',
    password: 'Password123!',
    username: 'bsc_enduser',
    fullName: 'ICT Department End User',
    role: 'Administrator' as const,
  },
];

async function main() {
  console.log('🚀 Setting up demo accounts in Supabase Auth & Prisma database...\n');

  for (const acc of DEMO_ACCOUNTS) {
    console.log(`Processing: ${acc.email} (${acc.role})...`);
    
    let userId: string | undefined;

    // 1. Try Signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: acc.email,
      password: acc.password,
    });

    if (signUpData?.user) {
      userId = signUpData.user.id;
    } else {
      // 2. Try SignIn if already registered
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: acc.email,
        password: acc.password,
      });

      if (signInData?.user) {
        userId = signInData.user.id;
      } else {
        console.warn(`  ⚠️ Could not authenticate or create ${acc.email}: ${signUpError?.message || signInError?.message}`);
      }
    }

    if (userId) {
      const profile = await prisma.userProfile.upsert({
        where: { id: userId },
        update: {
          username: acc.username,
          fullName: acc.fullName,
          email: acc.email,
          role: acc.role,
          isActive: true,
        },
        create: {
          id: userId,
          username: acc.username,
          fullName: acc.fullName,
          email: acc.email,
          role: acc.role,
          isActive: true,
        },
      });
      console.log(`  ✅ Account Ready! Email: ${acc.email} | Password: ${acc.password} | Role: ${profile.role}`);
    }
  }

  console.log('\n✨ Demo accounts setup complete!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
