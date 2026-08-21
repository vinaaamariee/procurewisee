-- PPMP documents are private. Authenticated End Users may manage only objects
-- whose first path segment matches their Supabase user id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ppmp-documents',
  'ppmp-documents',
  false,
  10485760,
  array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ppmp_document_owner_select" on storage.objects;
drop policy if exists "ppmp_document_owner_insert" on storage.objects;
drop policy if exists "ppmp_document_owner_delete" on storage.objects;

create policy "ppmp_document_owner_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'ppmp-documents'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "ppmp_document_owner_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'ppmp-documents'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "ppmp_document_owner_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'ppmp-documents'
  and owner_id = (select auth.uid()::text)
);
