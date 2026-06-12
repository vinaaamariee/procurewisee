import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function resetPassword(email: string, passwordPlain: string) {
  try {
    // Update the password in auth.users
    const result = await prisma.$executeRaw`
      UPDATE auth.users 
      SET encrypted_password = crypt(${passwordPlain}, gen_salt('bf', 10)) 
      WHERE email = ${email};
    `;
    console.log(`[Auth] Password for ${email} reset. Rows affected: ${result}`);

    // Activate the profile in user_profiles
    const profile = await prisma.userProfile.findFirst({
      where: { email }
    });

    if (profile) {
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { isActive: true }
      });
      console.log(`[Profile] Profile for ${email} activated.`);
    } else {
      console.log(`[Profile] Warning: No profile found in user_profiles for ${email}.`);
    }
  } catch (error) {
    console.error(`Error resetting password for ${email}:`, error);
  }
}

async function run() {
  console.log('Starting credentials setup for testing...');
  
  // 1. Procurement Officer
  await resetPassword('test123@gmail.com', 'password123');

  // 2. Administrative Approver
  await resetPassword('officer2@gmail.com', 'password123');

  // 3. Supplier
  await resetPassword('supp1@gmail.com', 'password123');

  console.log('Credentials setup complete!');
  await prisma.$disconnect();
}

run();
