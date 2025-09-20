-- sql/test_rls.sql
-- As anon (use SQL Editor's query with anon role if available):
-- read should work:
select id, title from offers limit 1;

-- write should fail under anon:
insert into offers (provider_id, title, discounted_price)
values ((select id from providers limit 1), 'Test', 1.00);
-- Expect: permission denied due to RLS