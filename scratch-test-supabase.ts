import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('email, role');
  
  if (error) {
    console.error('Supabase query error:', error);
  } else {
    console.log('Supabase User Profiles:', data);
  }
}

run();
