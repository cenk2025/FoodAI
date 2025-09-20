update profiles set is_admin = true
where lower(email) = lower('YOUR_EMAIL@example.com');
select id, email, is_admin from profiles where is_admin = true;