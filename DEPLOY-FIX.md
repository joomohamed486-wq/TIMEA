# TIMEA — Vercel/Supabase deployment fix

## 1. Supabase

Run `supabase/schema.sql` once in Supabase SQL Editor.
Then run `supabase/seed.sql` once to insert the demo categories, brands and products.

Verify:

```sql
select count(*) from public.products;
select count(*) from public.brands;
select count(*) from public.categories;
```

Expected demo products: 8.

## 2. Vercel environment variables

In Vercel -> Project -> Settings -> Environment Variables add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Enable both for Production and Preview.

After changing them, redeploy the project.

## 3. Important architecture fix

The project intentionally has **no Next.js Middleware**. TIMEA does not need global middleware for the current authentication flow. Authentication is handled in Route Handlers and Server Components through `@supabase/ssr`.

This prevents `MIDDLEWARE_INVOCATION_FAILED` from taking down every route.

## 4. Deployment

The Vercel Root Directory must be the directory containing this `package.json`.

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Do not add Prisma or Neon variables; this version uses Supabase directly.
