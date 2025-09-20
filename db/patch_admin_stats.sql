create or replace function admin_click_summary()
returns table(cnt bigint) language sql security definer as $$
  select count(*)::bigint from clickouts where at >= now() - interval '7 days'
$$;