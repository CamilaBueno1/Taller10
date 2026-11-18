-- Run this once in the SQL Editor of the Supabase project already used by the app.
alter table public.messages
  add column if not exists image_path text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'chat-images',
  'chat-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "mi-chat can read images in visible messages"
  on storage.objects;
create policy "mi-chat can read images in visible messages"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-images'
  and exists (
    select 1
    from public.messages
    where messages.image_path = storage.objects.name
  )
);

drop policy if exists "mi-chat users upload to their own folder"
  on storage.objects;
create policy "mi-chat users upload to their own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "mi-chat users remove their own uploaded images"
  on storage.objects;
create policy "mi-chat users remove their own uploaded images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'chat-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
