import "server-only";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "ppmp-documents";
const SIGNED_URL_TTL_SECONDS = 60 * 15;

export function getPpmpDocumentPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("http")) return value;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = value.indexOf(marker);
  if (markerIndex === -1) return null;
  return decodeURIComponent(value.slice(markerIndex + marker.length).split("?")[0]);
}

export async function createPpmpDocumentSignedUrl(value: string | null | undefined) {
  const path = getPpmpDocumentPath(value);
  if (!path) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error("[PPMP STORAGE] Failed to create signed URL:", error.message);
    return null;
  }
  return data.signedUrl;
}
