'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData){
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/?error=Invalid credentials');
  }

  revalidatePath('/', 'layout');
  return redirect('/end-user'); // Route to the entry point dashboard
}

export async function signout(){
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  return redirect('/');
}