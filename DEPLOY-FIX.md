# TIMEA production deployment

## Supabase
1. Run `supabase/schema.sql` in the SQL Editor.
2. Run `supabase/seed.sql`.
3. Verify `select count(*) from public.products;` returns the seeded products.
4. Verify Data API access for `products`, `brands`, and `categories`. The schema now includes explicit grants for `anon` and `authenticated`, in addition to RLS.

## Vercel
Set these Environment Variables for Production, Preview and Development:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Do not add Prisma, Neon, or a service-role key to the browser/client environment.

## Health check
After deployment open `/api/health`. A healthy deployment returns JSON with `ok: true`. If it returns `ok: false`, the `stage` and `error` fields identify the failing layer.

## Important
There is intentionally no Next.js middleware in this project. Public catalog pages do not require authentication middleware.
