select storage.create_bucket('offer-images', public => true, file_size_limit => 5242880);

-- storage.objects RLS
create policy if not exists "offer-images public read"
on storage.objects for select
using (bucket_id = 'offer-images');

create policy if not exists "offer-images admin insert"
on storage.objects for insert
with check (
  bucket_id = 'offer-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy if not exists "offer-images admin update"
on storage.objects for update
using (
  bucket_id = 'offer-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy if not exists "offer-images admin delete"
on storage.objects for delete
using (
  bucket_id = 'offer-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);