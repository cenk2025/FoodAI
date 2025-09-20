# Clickout Smoke Test

1) Go to `/offers`
2) Click a card's "Siirry tarjoukseen" (links to `/go/{offerId}`)
3) You should be redirected to the deep_link (example.com/*)
4) In Supabase → Table editor → clickouts: verify a new row exists (ua, ip, offer_id)