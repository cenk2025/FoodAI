create or replace function admin_clicks_by_provider()
returns table(provider text, clicks bigint) language sql security definer as $$
  select coalesce(p.slug,'unknown') as provider, count(*)::bigint
  from clickouts c left join providers p on p.id = c.provider_id
  where c.at >= now() - interval '30 days'
  group by 1 order by 2 desc;
$$;

create or replace function admin_clicks_by_city()
returns table(city text, clicks bigint) language sql security definer as $$
  select coalesce(o.city,'-') as city, count(*)::bigint
  from clickouts c join offers o on o.id = c.offer_id
  where c.at >= now() - interval '30 days'
  group by 1 order by 2 desc;
$$;

create or replace function admin_click_summary()
returns table(cnt bigint)
language sql security definer as $$
  select count(*)::bigint from clickouts where at >= now() - interval '7 days';
$$;

create or replace function admin_revenue_30d()
returns table(day date, revenue numeric) language sql security definer as $$
  select date_trunc('day', occurred_at)::date as day, sum(commission_amount)::numeric as revenue
  from commissions
  where occurred_at >= now() - interval '30 days' and status='approved'
  group by 1 order by 1;
$$;