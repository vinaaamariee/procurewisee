import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'test123@gmail.com';
  const password = 'password123';
  
  console.log(`Logging in as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }

  console.log('Auth Success! User ID:', authData.user.id);

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, username, fullName, email, role, isActive, createdAt')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Profile Error:', profileError);
  } else {
    console.log('Profile Role fetched by Supabase JS Client:', profile.role);
    console.log('Full profile object:', profile);
  }
}

run();
