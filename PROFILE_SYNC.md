# Profile Sync Options

**Option A — Auth Hooks (recommended if available in your project):**
- In Supabase Dashboard → Authentication → Hooks
- Add `user.created` and `user.updated` webhooks to:
  `POST https://YOUR_SITE_DOMAIN/api/auth/profile-sync`

**Option B — Client fallback:**
Right after successful sign-in in the client, call:
`await fetch('/api/auth/profile-sync', { method:'POST', body: JSON.stringify({ user: (await supabase.auth.getUser()).data.user }), headers:{'Content-Type':'application/json'} })`