# Generate Types (Supabase → TypeScript)
1) Install CLI: `brew install supabase/tap/supabase`
2) Login: `supabase login`
3) Find project ref: Dashboard → Settings → General → Project reference
4) Generate:
```bash
supabase gen types typescript --project-id <YOUR_PROJECT_REF> --schema public > types/supabase.ts
```

Re-run this after schema changes.

*(Projede `db:gen` script'i varsa onu da güncelleyebilirsin.)*

**Note**: After applying the addon schema, re-generate the types to include the new tables (clickouts, commissions, profiles, favorites, alerts) and their RLS policies.