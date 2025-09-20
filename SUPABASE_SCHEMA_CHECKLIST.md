# Apply Schema – Quick Checklist

1) Open Supabase Dashboard → SQL Editor
2) Paste the entire contents of `sql/foodai_schema_v1.sql`
3) Click RUN and wait for "Success"

## Sanity Queries (paste and run one by one)
-- tables exist?
select table_name from information_schema.tables
 where table_schema='public'
   and table_name in ('providers','restaurants','offers','clickouts','commissions','profiles','favorites','alerts');

-- view exists?
select * from offer_index limit 1;

-- RLS status?
select relname as table, relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and relkind='r' and relname in
('providers','restaurants','offers','clickouts','commissions','profiles','favorites','alerts');

-- functions exist?
select proname, prokind from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and proname ilike 'admin_%';

-- grants exist?
select grantee, privilege_type from information_schema.role_table_grants
where table_name='offer_index' and privilege_type='SELECT';