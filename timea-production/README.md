# TIMEA Watch Store — Production-oriented Vercel package

## Included
- Next.js + TypeScript
- PostgreSQL + Prisma
- Customer registration/login/logout with secure httpOnly session cookie
- Customer account
- Cart for guest/session and logged-in user
- Checkout + real database Order creation
- Atomic stock deduction + inventory transaction
- Coupon validation endpoint
- Admin product CRUD API with server-side role guard
- Storefront, products, cart, checkout, account, admin overview
- Arabic RTL responsive UI
- Seed data

## Deployment
1. Create a hosted PostgreSQL database (Supabase/Neon/etc.).
2. Set `DATABASE_URL` in Vercel.
3. Deploy.
4. Run `npx prisma db push` against the production database, then `npm run db:seed` if you want the demo catalog.
5. Add `NEXT_PUBLIC_APP_URL` if needed.

## Payment
COD is implemented. Card payment is intentionally provider-neutral. To accept online cards, configure a provider such as Paymob or Stripe and implement its server-side payment intent + webhook using the existing Payment model. Never put provider secret keys in the browser.

## Storage
Product images currently use remote image URLs for the seeded catalog. For production uploads, connect Cloudinary or Vercel Blob and store the returned URL in Product.image.

## Important production hardening
Before public launch, add rate limiting/WAF, email verification, password reset flow, transactional email, payment webhooks, shipping integration, image upload, backups/monitoring, migrations, and audit logging. The package does not pretend those external provider credentials/integrations exist without configuration.
