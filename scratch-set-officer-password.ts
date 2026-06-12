import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function run() {
  const email = 'officer3@procurewise.local';
  console.log(`Resetting password for ${email} to 'password123'...`);
  
  try {
    // We update the password hash in the auth.users table using pgcrypto's crypt function
    const result = await prisma.$executeRaw`
      UPDATE auth.users 
      SET encrypted_password = crypt('password123', gen_salt('bf', 10)) 
      WHERE email = ${email};
    `;
    
    console.log(`Password reset completed. Rows affected: ${result}`);
    
    // Also let's make sure the profile is active
    const profile = await prisma.userProfile.findFirst({
      where: { email }
    });
    
    if (profile) {
      if (!profile.isActive) {
        await prisma.userProfile.update({
          where: { id: profile.id },
          data: { isActive: true }
        });
        console.log('User profile was deactivated, successfully activated it.');
      } else {
        console.log('User profile is already active.');
      }
    } else {
      console.log('Warning: No profile found in user_profiles table for this email.');
    }
  } catch (e) {
    console.error('Error during password reset:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
