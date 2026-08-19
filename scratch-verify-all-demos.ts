import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { prisma } from './src/lib/prisma';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const accounts = [
  { role: 'Procurement Officer', email: 'officer@bsc.edu.ph', password: 'password123' },
  { role: 'Administrative Approver', email: 'approver@bsc.edu.ph', password: 'password123' },
  { role: 'End User', email: 'enduser@bsc.edu.ph', password: 'password123' },
  { role: 'Supplier (Merchant)', email: 'carloebalin@gmail.com', password: 'password123' }
];

async function verifyDemoAccounts() {
  console.log('--- Verifying All Demo Accounts ---');
  for (const acc of accounts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password,
    });

    if (error) {
      console.log(`❌ [${acc.role}] ${acc.email} FAILED:`, error.message);
    } else {
      const profile = await prisma.userProfile.findUnique({
        where: { id: data.user.id }
      });
      console.log(`✅ [${acc.role}] ${acc.email} SUCCESS | Role: ${profile?.role} | Name: ${profile?.fullName}`);
    }
  }
  await prisma.$disconnect();
}

verifyDemoAccounts();
