import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function run() {
  const email = 'test123@gmail.com';
  const password = 'password123';
  
  console.log('Supabase URL:', supabaseUrl);
  
  console.time('Total Time');
  
  console.time('Create Supabase Client');
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.timeEnd('Create Supabase Client');
  
  console.log(`Logging in as ${email}...`);
  console.time('supabase.auth.signInWithPassword');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  console.timeEnd('supabase.auth.signInWithPassword');

  if (authError) {
    console.error('Auth Error:', authError);
    console.timeEnd('Total Time');
    return;
  }

  console.log('Auth Success! User ID:', authData.user.id);

  console.time('Fetch user profile from Supabase Client');
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, role, isActive')
    .eq('id', authData.user.id)
    .single();
  console.timeEnd('Fetch user profile from Supabase Client');

  if (profileError) {
    console.error('Profile Error:', profileError);
  } else {
    console.log('Profile:', profile);
  }
  
  console.timeEnd('Total Time');
}

run();
