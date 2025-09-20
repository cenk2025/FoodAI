alter table profiles add column if not exists is_admin boolean default false;
create index if not exists idx_profiles_admin on profiles(is_admin);

-- RLS: admin okuma/yazma service_role ile yapılır; panelde sadece okumalar yapılacaksa
-- ayrıca gerekirse admin endpointleri server-side service_role ile çalışacak.