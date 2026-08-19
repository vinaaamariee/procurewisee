import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log("Setting up Supabase Storage bucket for PPMP documents...\n");

  // Check if bucket already exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Failed to list buckets:", listError.message);
    process.exit(1);
  }

  const existing = buckets?.find((b) => b.name === "ppmp-documents");
  if (existing) {
    console.log('Bucket "ppmp-documents" already exists. Updating...');
    const { error: updateError } = await supabase.storage.updateBucket("ppmp-documents", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
    });
    if (updateError) {
      console.error("Failed to update bucket:", updateError.message);
      process.exit(1);
    }
    console.log("Bucket updated successfully.");
  } else {
    console.log('Creating bucket "ppmp-documents"...');
    const { error: createError } = await supabase.storage.createBucket("ppmp-documents", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
    });
    if (createError) {
      console.error("Failed to create bucket:", createError.message);
      process.exit(1);
    }
    console.log("Bucket created successfully.");
  }

  // Verify
  const { data: verify } = await supabase.storage.getBucket("ppmp-documents");
  console.log("\nBucket configuration:");
  console.log(`  Name: ${verify?.name}`);
  console.log(`  Public: ${verify?.public}`);
  console.log(`  File size limit: ${(verify?.fileSizeLimit || 0) / 1024 / 1024}MB`);
  console.log(`  Allowed MIME types: ${verify?.allowedMimeTypes?.join(", ")}`);
  console.log("\nSetup complete.");
}

setup().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
