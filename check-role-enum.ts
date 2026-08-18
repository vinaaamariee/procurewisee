import { prisma } from "./src/lib/prisma";
import { createClient } from "@supabase/supabase-js";

async function checkRoles() {
  const users = await prisma.userProfile.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log("Prisma user roles:");
  users.forEach(u => console.log("  ", u.email, "-> role:", JSON.stringify(u.role)));

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!
  );

  const { data: sbProfiles, error } = await sb
    .from("user_profiles")
    .select("id, email, role, is_active");

  console.log("\nSupabase REST user_profiles roles (error:", error, "):");
  sbProfiles?.forEach(p => console.log("  ", p.email, "-> role:", JSON.stringify(p.role)));
}

checkRoles().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
