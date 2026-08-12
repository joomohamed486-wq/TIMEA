# TIMEA Watch Store — Vercel + Supabase (No Prisma)

This version removes Prisma completely. Database schema, RLS policies, trigger, and atomic order/inventory logic are in `supabase/schema.sql`. Demo catalog is in `supabase/seed.sql`.

## Setup
1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql` once.
3. Run `supabase/seed.sql` once to add the demo watches.
4. In Supabase **Project Settings → API**, copy Project URL and anon/public key.
5. In Vercel add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
6. Deploy from GitHub. Build command is simply `npm run build`.

## Auth
Uses Supabase Auth (email/password) and a `profiles` table created automatically by a database trigger.

## Orders
`public.create_order()` is a PostgreSQL RPC that locks products, checks stock, creates the order/items/payment, deducts stock, and records inventory transactions atomically.

## Payment
Cash on Delivery is wired. Online card payments should be added with your chosen provider (Paymob/Stripe) using server-side payment intents and webhooks.

## No Prisma
There is no Prisma dependency, schema, migration command, or seed script. The only database setup is SQL in the Supabase dashboard.
