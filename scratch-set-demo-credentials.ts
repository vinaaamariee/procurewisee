import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  console.log('🔄 Starting demo credentials cleanup and verification...\n');

  const legacyEmails = [
    'test123@gmail.com',
    'officer2@gmail.com',
    'tapprover2@gmail.com',
    'supp1@gmail.com'
  ];

  const officialDemoAccounts = [
    { email: 'officer@bsc.edu.ph', role: 'ProcurementOfficer', fullName: 'Procurement Officer Admin' },
    { email: 'approver@bsc.edu.ph', role: 'AdministrativeApprover', fullName: 'Procurement Officer II' },
    { email: 'enduser@bsc.edu.ph', role: 'EndUser', fullName: 'ICT Department End User' }
  ];

  try {
    // 1. Delete legacy credentials
    console.log('🗑️ Removing legacy developer accounts...');
    for (const email of legacyEmails) {
      try {
        // Delete profile entries first (references user ID)
        await prisma.userProfile.deleteMany({ where: { email } });
        // Delete auth.users using raw SQL
        const result = await prisma.$executeRaw`
          DELETE FROM auth.users WHERE email = ${email};
        `;
        console.log(`  ✔ Deleted ${email} (Auth Rows: ${result})`);
      } catch (err: any) {
        console.log(`  ⚠ Skip/Error on legacy account ${email}:`, err.message || err);
      }
    }
    console.log();

    // 2. Set/Reset password for official institutional demo accounts to 'password123'
    console.log('🔑 Configuring official Batanes State College demo credentials...');
    for (const account of officialDemoAccounts) {
      // a. Reset password in auth.users
      const updateResult = await prisma.$executeRaw`
        UPDATE auth.users 
        SET encrypted_password = crypt('password123', gen_salt('bf', 10)) 
        WHERE email = ${account.email};
      `;
      console.log(`  ✔ [Auth] Password set to 'password123' for ${account.email} (Affected: ${updateResult})`);

      // b. Verify/Update profile in user_profiles
      const profile = await prisma.userProfile.findFirst({
        where: { email: account.email }
      });

      if (profile) {
        await prisma.userProfile.update({
          where: { id: profile.id },
          data: {
            isActive: true,
            role: account.role as any,
            fullName: account.fullName
          }
        });
        console.log(`  ✔ [Profile] Active & configured role to '${account.role}' for ${account.email}`);
      } else {
        console.log(`  ⚠ [Profile] Warning: Profile not found for ${account.email}. Creating it now...`);
        // Find auth user ID first to bind foreign key correctly
        const authUsers: any = await prisma.$queryRaw`
          SELECT id FROM auth.users WHERE email = ${account.email} LIMIT 1;
        `;
        if (authUsers && authUsers.length > 0) {
          const authId = authUsers[0].id;
          await prisma.userProfile.create({
            data: {
              id: authId,
              email: account.email,
              username: account.email.split('@')[0],
              fullName: account.fullName,
              role: account.role as any,
              isActive: true
            }
          });
          console.log(`  ✔ [Profile] Successfully created profile for ${account.email}`);
        } else {
          console.log(`  ❌ [Profile] FAILED: No auth user exists in auth.users for ${account.email}. Please register it first.`);
        }
      }
    }

    console.log('\n✨ Demo credentials configuration successfully complete!');
  } catch (error: any) {
    console.error('❌ Configuration script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
