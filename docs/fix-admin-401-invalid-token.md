# Fix: Admin 401 "Invalid or expired token"

If `/api/admin/*` returns `401` with `Invalid or expired token`, the backend usually cannot verify the JWT against your Supabase project. The most common cause is a mismatch between `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## What to check

1. Open `backend/.env`.
2. Confirm `SUPABASE_URL` points to the same Supabase project whose `service_role` key you copied.
3. Make sure `SUPABASE_SERVICE_ROLE_KEY` is the server-side `service_role` key, not the anon/publishable key.
4. Remove any accidental quotes, spaces, or line breaks in the key value.
5. Restart the backend after changing environment variables.

## How to get the correct key

1. Open the Supabase dashboard for the project referenced by `SUPABASE_URL`.
2. Go to `Project Settings -> API`.
3. Copy the `service_role` key from that same project.
4. Paste it into `backend/.env` as:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Quick validation

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` come from the same project.
- The backend has been restarted.
- The admin user is logged in again so the browser has a fresh access token.
- Admin requests now return `200` or `403` instead of `401`.

If the error persists after those checks, verify the admin account itself matches the configured admin email or has `profiles.role = 'admin'` as described in `docs/admin-setup.md`.
