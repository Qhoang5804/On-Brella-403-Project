# Admin role setup

## Hardcoded admin (no DB required)

Admin access is **hardcoded by email** so you don’t need the `profiles.role` column or any migration for admin-only.

- **Default admin email:** `admin@onbrella.com`
- **Frontend override:** set `VITE_ADMIN_EMAIL` in `frontend/.env`
- **Backend override:** set `ADMIN_EMAIL` in `backend/.env`

Any user who signs in with that email is treated as admin (Profile → Admin, and `/api/admin/*` will accept their JWT). Use any password you set for that account in Supabase.

### Steps

1. **Create the admin user in Supabase** (if needed): Authentication → Users → Add user → email `admin@onbrella.com` and a password of your choice.
2. **Log in** at `/login` with that email and password. You’ll see **Admin** in Profile and can open `/admin`.
3. **Backend admin API** needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env` so the server can verify the JWT. Without them, admin API calls return **503** with a message to set these.
   - **SUPABASE_URL**: same as in frontend (e.g. `https://xxxx.supabase.co`).
   - **SUPABASE_SERVICE_ROLE_KEY**: from Supabase Dashboard → Project Settings → API → **Legacy anon, service_role** tab → `service_role` (secret). Do not use the anon key.
   - **Important:** The service_role key must be from the **same project** as `SUPABASE_URL`. The project ref is the `xxxx` part of `https://xxxx.supabase.co`. Open that project in the dashboard: `https://supabase.com/dashboard/project/xxxx` (replace `xxxx` with your ref). If you get "Invalid API key", you are likely using a key from a different project—switch to the project that matches your URL and copy its Legacy service_role key.

---

## Optional: DB role (profiles.role)

You can still use the database for admin:

1. Run [supabase-add-profiles-role.sql](supabase-add-profiles-role.sql) in Supabase SQL Editor.
2. Set an admin: `UPDATE profiles SET role = 'admin' WHERE email = 'someone@example.com';`

If a user’s email matches the hardcoded admin email **or** their `profiles.role` is `'admin'`, they get admin access.

## Related SQL setup

- `supabase-create-profiles-table.sql` for the `profiles` table
- `supabase-create-app-content-table.sql` for admin-managed content documents
- `supabase-create-support-requests-table.sql` for support and report workflows
- `supabase-create-config-table.sql` for admin-managed pricing values
