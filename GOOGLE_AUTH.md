# Google Sign-In (Supabase Auth)

1) Supabase Dashboard → Authentication → Providers → Google → Enable
2) Client ID & Secret: from Google Cloud Console (Authorized redirect: `https://<your-project>.supabase.co/auth/v1/callback`)
3) In `.env.local` keep only public anon URL/key; no secrets on client
4) In app, call:
```ts
await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: `${location.origin}/auth/callback` }})
```

After redirect back, ensure profile sync is called (hook or client fallback).